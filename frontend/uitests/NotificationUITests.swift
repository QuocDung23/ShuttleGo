import XCTest

final class NotificationUITests: ShuttleGoUIFixture {
    @MainActor private func openNotifications(in app: XCUIApplication) throws {
        XCTAssertTrue(app.textFields["Tìm sân theo tên hoặc khu vực"].waitForExistence(timeout: 20))
        app.open(try XCTUnwrap(URL(string: "ltdd://(guest)/notifications")))
        XCTAssertTrue(app.staticTexts["Thông báo"].waitForExistence(timeout: 20))
    }

    @MainActor func testNOTI01AccountWithoutNotificationsShowsEmptyState() throws {
        let phone = try fixture("OTHER_PLAYER_PHONE")
        let app = try signIn(phone: phone)
        try openNotifications(in: app)
        XCTAssertTrue(app.staticTexts["Chưa có thông báo nào."].waitForExistence(timeout: 20))
    }

    @MainActor func testNOTI08RecipientNotificationIsHiddenFromOtherPlayer() throws {
        let title = try fixture("NOTIFICATION_TITLE")
        let app = try signIn(phone: fixture("OTHER_PLAYER_PHONE"))
        try openNotifications(in: app)
        XCTAssertFalse(app.staticTexts[title].exists)
        XCTAssertTrue(app.staticTexts["Chưa có thông báo nào."].exists)
    }
}
