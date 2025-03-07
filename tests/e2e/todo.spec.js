const { test, expect } = require('@playwright/test');

test.describe('TODOアプリケーションのE2Eテスト', () => {
    // テスト全体で使用する認証情報（固定）
    const testUsername = 'sasao';
    const testPassword = 'ts05140952';

    test.beforeEach(async ({ page }) => {
        // テスト前にアプリケーションにアクセスしてログイン
        await page.goto('http://localhost:1234');
        await page.fill('#username', testUsername);
        await page.fill('#password', testPassword);
        await page.click('button:has-text("ログイン")');
        
        // メインページにリダイレクトされることを確認
        await expect(page).toHaveURL('http://localhost:1234/');
    });

    test('ログイン状態の確認', async ({ page }) => {
        // ユーザー情報が正しく表示されていることを確認
        await expect(page.locator('.user-info')).toContainText(testUsername);
    });

    test('タスクの追加、完了、削除', async ({ page }) => {
        // 既存のタスクをすべて削除
        const deleteButtons = await page.locator('button:has-text("削除")').all();
        for (const button of deleteButtons) {
            await button.click();
        }
        
        // タスクの追加
        const taskTitle = 'テストタスク';
        await page.fill('#newTaskInput', taskTitle);
        await page.click('button:has-text("追加")');
        
        // 追加したタスクが表示されるまで待機（タイムアウトを30秒に延長）
        await expect(page.locator('.task-title', { hasText: taskTitle })).toBeVisible({ timeout: 30000 });
        
        // 追加したタスクの要素を取得
        const taskItem = page.locator('.task-item', { has: page.locator('.task-title', { hasText: taskTitle }) });
        
        // チェックボックスを特定して完了状態に変更
        await taskItem.locator('input[type="checkbox"]').check();
        await expect(taskItem).toHaveClass(/completed/);
        
        // 削除ボタンを特定して削除
        await taskItem.locator('button:has-text("削除")').click();
        await expect(taskItem).not.toBeVisible();
    });

    test('タスクのフィルタリング', async ({ page }) => {
        // 既存のタスクをすべて削除し、完了を待機
        const deleteButtons = await page.locator('button:has-text("削除")').all();
        for (const button of deleteButtons) {
            await button.click();
            // 削除が完了するまで待機
            await page.waitForTimeout(500);
        }

        // タスク一覧がクリアされるまで待機
        await expect(page.locator('.task-item')).not.toBeVisible();

        // 複数のタスクを追加
        const tasks = ['フィルターテスト1', 'フィルターテスト2', 'フィルターテスト3'];

        for (const task of tasks) {
            await page.fill('#newTaskInput', task);
            await page.click('button:has-text("追加")');
            // タスクが追加されるまで待機
            await expect(page.locator('.task-title', { hasText: task })).toBeVisible({ timeout: 30000 });
        }

        // 2番目のタスクを完了状態に変更
        const taskItems = await page.locator('.task-item').all();
        await taskItems[1].locator('input[type="checkbox"]').check();
        
        // 未完了タスクのフィルター
        await page.click('button[data-filter="active"]');
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト1' })).toBeVisible();
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト2' })).not.toBeVisible();
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト3' })).toBeVisible();
        
        // 完了済みタスクのフィルター
        await page.click('button[data-filter="completed"]');
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト1' })).not.toBeVisible();
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト2' })).toBeVisible();
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト3' })).not.toBeVisible();
        
        // すべてのタスクを表示
        await page.click('button[data-filter="all"]');
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト1' })).toBeVisible();
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト2' })).toBeVisible();
        await expect(page.locator('.task-title', { hasText: 'フィルターテスト3' })).toBeVisible();
    });

    test('ログアウト機能', async ({ page }) => {
        // ログアウト
        await page.click('button:has-text("ログアウト")');
        
        // ログインページにリダイレクトされることを確認
        await expect(page).toHaveURL(/.*login/);
    });
});
