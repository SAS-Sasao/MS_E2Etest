const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// スクリーンショット保存用のヘルパー関数
async function saveScreenshot(page, testInfo, stepName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testTitle = testInfo.title.replace(/[^a-z0-9]/gi, '_');
    const dirPath = path.join('test-screenshots', timestamp.split('T')[0], testTitle);
    
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // スクリーンショットを保存
    const fileName = `${testInfo.retry}_${stepName}.png`;
    await page.screenshot({
        path: path.join(dirPath, fileName),
        fullPage: true
    });
}

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

    test('ログイン状態の確認', async ({ page }, testInfo) => {
        // ユーザー情報が正しく表示されていることを確認
        await expect(page.locator('.user-info')).toContainText(testUsername);
        await saveScreenshot(page, testInfo, '01_ログイン状態確認');
    });

    test('タスクの追加、完了、削除', async ({ page }, testInfo) => {
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
        await saveScreenshot(page, testInfo, '01_タスク追加後');
        
        // 追加したタスクの要素を取得
        const taskItem = page.locator('.task-item', { has: page.locator('.task-title', { hasText: taskTitle }) });
        
        // チェックボックスを特定して完了状態に変更
        await taskItem.locator('input[type="checkbox"]').check();
        await expect(taskItem).toHaveClass(/completed/);
        await saveScreenshot(page, testInfo, '02_タスク完了後');
        
        // 削除ボタンを特定して削除
        await taskItem.locator('button:has-text("削除")').click();
        await expect(taskItem).not.toBeVisible();
        await saveScreenshot(page, testInfo, '03_タスク削除後');
    });

    test('タスクのフィルタリング', async ({ page }, testInfo) => {
        // 既存のタスクをすべて削除し、完了を待機
        const deleteButtons = await page.locator('button:has-text("削除")').all();
        for (const button of deleteButtons) {
            await button.click();
            // 削除が完了するまで待機
            await page.waitForTimeout(500);
        }

        // タスク一覧がクリアされるまで待機
        await expect(page.locator('.task-item')).not.toBeVisible();

        // 複数のタスクを追加（タイムスタンプを付与して一意性を確保）
        const timestamp = Date.now();
        const tasks = [
            `フィルターテスト1_${timestamp}`,
            `フィルターテスト2_${timestamp}`,
            `フィルターテスト3_${timestamp}`
        ];

        // タスクを順番に追加し、それぞれの追加完了を待機
        for (const task of tasks) {
            await page.fill('#newTaskInput', task);
            await page.click('button:has-text("追加")');
            // タスクが追加され、表示されるまで待機
            await expect(page.locator('.task-item', {
                has: page.locator('.task-title', { hasText: task })
            })).toBeVisible({ timeout: 30000 });
        }
        await saveScreenshot(page, testInfo, '01_全タスク追加後');

        // 2番目のタスクを完了状態に変更
        await page.locator('.task-item', {
            has: page.locator('.task-title', { hasText: tasks[1] })
        }).locator('input[type="checkbox"]').check();

        // フィルター処理の前に状態が反映されるまで待機
        await page.waitForTimeout(500);
        
        // 未完了タスクのフィルター
        await page.click('button[data-filter="active"]');
        await saveScreenshot(page, testInfo, '02_未完了タスクフィルター');
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[0] }) })).toBeVisible();
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[1] }) })).not.toBeVisible();
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[2] }) })).toBeVisible();
        
        // 完了済みタスクのフィルター
        await page.click('button[data-filter="completed"]');
        await saveScreenshot(page, testInfo, '03_完了済みタスクフィルター');
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[0] }) })).not.toBeVisible();
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[1] }) })).toBeVisible();
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[2] }) })).not.toBeVisible();
        
        // すべてのタスクを表示
        await page.click('button[data-filter="all"]');
        await saveScreenshot(page, testInfo, '04_全タスク表示');
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[0] }) })).toBeVisible();
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[1] }) })).toBeVisible();
        await expect(page.locator('.task-item', { has: page.locator('.task-title', { hasText: tasks[2] }) })).toBeVisible();
    });

    test('ログアウト機能', async ({ page }, testInfo) => {
        // ログアウト前の状態をキャプチャ
        await saveScreenshot(page, testInfo, '01_ログアウト前');
        
        // ログアウト
        await page.click('button:has-text("ログアウト")');
        
        // ログインページにリダイレクトされることを確認
        await expect(page).toHaveURL(/.*login/);
        await saveScreenshot(page, testInfo, '02_ログアウト後');
    });
});
