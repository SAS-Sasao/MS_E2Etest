const { test, expect } = require('@playwright/test');

test.describe('TODOアプリケーションのE2Eテスト', () => {
    // テスト全体で使用する認証情報
    const testUsername = `testuser_${Date.now()}`;
    const testPassword = 'testpass123';

    test.beforeEach(async ({ page }) => {
        // テスト前にアプリケーションにアクセス
        await page.goto('http://localhost:1234');

        // 登録ページに移動
        await page.click('text=登録');
        
        // ユーザー登録
        await page.fill('#username', testUsername);
        await page.fill('#password', testPassword);
        await page.fill('#confirmPassword', testPassword);
        await page.click('button:has-text("登録")');
        
        // ログインページにリダイレクトされることを確認
        await expect(page).toHaveURL(/.*login/);
        
        // ログイン
        await page.fill('#username', testUsername);
        await page.fill('#password', testPassword);
        await page.click('button:has-text("ログイン")');
        
        // メインページにリダイレクトされることを確認
        await expect(page).toHaveURL('http://localhost:1234/');
        await expect(page.locator('.user-info')).toContainText(testUsername);
    });

    test('新規ユーザー登録とログインの検証', async ({ page }) => {
        // ユーザー情報が正しく表示されていることを確認
        await expect(page.locator('.user-info')).toContainText(testUsername);
    });

    test('タスクの追加、完了、削除', async ({ page }) => {
        // タスクの追加
        const taskTitle = `テストタスク_${Date.now()}`;
        await page.fill('#newTaskInput', taskTitle);
        await page.click('button:has-text("追加")');
        
        // タスクが追加されたことを確認
        const taskElement = page.locator(`.task-title:has-text("${taskTitle}")`);
        await expect(taskElement).toBeVisible();
        
        // タスクを完了状態に変更
        await page.check(`text=${taskTitle} >> xpath=../preceding-sibling::input[@type="checkbox"]`);
        await expect(page.locator(`.task-item:has-text("${taskTitle}")`)).toHaveClass(/completed/);
        
        // タスクを削除
        await page.click(`text=${taskTitle} >> xpath=../..//button[text()="削除"]`);
        await expect(taskElement).not.toBeVisible();
    });

    test('タスクのフィルタリング', async ({ page }) => {
        // 複数のタスクを追加
        const tasks = ['タスク1', 'タスク2', 'タスク3'];
        for (const task of tasks) {
            await page.fill('#newTaskInput', task);
            await page.click('button:has-text("追加")');
        }
        
        // 2番目のタスクを完了状態に
        await page.check(`text=タスク2 >> xpath=../preceding-sibling::input[@type="checkbox"]`);
        
        // 未完了タスクのフィルター
        await page.click('button[data-filter="active"]');
        await expect(page.locator('text=タスク1')).toBeVisible();
        await expect(page.locator('text=タスク2')).not.toBeVisible();
        await expect(page.locator('text=タスク3')).toBeVisible();
        
        // 完了済みタスクのフィルター
        await page.click('button[data-filter="completed"]');
        await expect(page.locator('text=タスク1')).not.toBeVisible();
        await expect(page.locator('text=タスク2')).toBeVisible();
        await expect(page.locator('text=タスク3')).not.toBeVisible();
        
        // すべてのタスクを表示
        await page.click('button[data-filter="all"]');
        await expect(page.locator('text=タスク1')).toBeVisible();
        await expect(page.locator('text=タスク2')).toBeVisible();
        await expect(page.locator('text=タスク3')).toBeVisible();
    });

    test('ログアウト機能', async ({ page }) => {
        // ログアウト
        await page.click('button:has-text("ログアウト")');
        
        // ログインページにリダイレクトされることを確認
        await expect(page).toHaveURL(/.*login/);
    });
});
