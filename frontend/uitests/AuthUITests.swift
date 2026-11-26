import XCTest

final class AuthUITests: ShuttleGoUIFixture {
    @MainActor func testAUTH01PlayerRegistrationCreatesAnAccount() throws {
        let app = try registrationScreen()
        try fillRegistration(app, phone: fixture("REG_PLAYER_PHONE"), role: "player")
        XCTAssertTrue(app.textFields["Tìm sân theo tên hoặc khu vực"].waitForExistence(timeout: 20))
    }

    @MainActor func testAUTH02OwnerRegistrationOpensVenueSetup() throws {
        let app = try registrationScreen()
        try fillRegistration(app, phone: fixture("REG_OWNER_PHONE"), role: "owner")
        XCTAssertTrue(app.staticTexts["Thông tin sân"].waitForExistence(timeout: 20))
    }

    @MainActor func testAUTH07ValidPlayerCanSignIn() throws {
        let app = try signIn()
        XCTAssertTrue(app.textFields["Tìm sân theo tên hoặc khu vực"].waitForExistence(timeout: 20))
    }

    @MainActor func testAUTH08AdminCanSignIn() throws {
        let app = try signIn(phone: fixture("ADMIN_PHONE"))
        XCTAssertTrue(app.staticTexts["Quản lý sân"].waitForExistence(timeout: 20))
    }

    @MainActor func testAUTH09WrongPasswordShowsError() throws {
        let app = try loginScreen()
        submit(app, phone: try fixture("PLAYER_PHONE"), password: "WrongPassword123")
        XCTAssertTrue(app.staticTexts["Số điện thoại/tài khoản hoặc mật khẩu không đúng."]
            .waitForExistence(timeout: 15))
    }

    @MainActor func testAUTH10LogoutRemainsSignedOutAfterRelaunch() throws {
        let app = try signIn()
        let dismissPasswordPrompt = app.buttons["Để sau"]
        if dismissPasswordPrompt.waitForExistence(timeout: 3) {
            tapVisible(dismissPasswordPrompt, in: app)
        }
        app.open(try XCTUnwrap(URL(string: "ltdd://profile")))
        XCTAssertTrue(app.staticTexts["Tài khoản"].waitForExistence(timeout: 15))
        let logout = app.buttons["Đăng xuất"]
        XCTAssertTrue(logout.waitForExistence(timeout: 15))
        tapVisible(logout, in: app)
        XCTAssertTrue(app.buttons["login-submit"].waitForExistence(timeout: 15))

        app.terminate()
        app.launch()
        app.open(try XCTUnwrap(URL(string: "ltdd://my-bookings")))
        XCTAssertTrue(app.staticTexts["Đăng nhập để xem lịch đặt"].waitForExistence(timeout: 20))
    }

    @MainActor func testAUTH11MissingPhoneShowsValidationError() throws {
        let app = try loginScreen()
        submit(app, password: "ShuttleGoUITest123")
        XCTAssertTrue(app.staticTexts["Vui lòng nhập số điện thoại và mật khẩu."].exists)
    }

    @MainActor func testAUTH12MissingPasswordShowsValidationError() throws {
        let app = try loginScreen()
        submit(app, phone: "0901234567")
        XCTAssertTrue(app.staticTexts["Vui lòng nhập số điện thoại và mật khẩu."].exists)
    }

    @MainActor func testAUTH13MissingBothFieldsShowsValidationError() throws {
        let app = try loginScreen()
        submit(app)
        XCTAssertTrue(app.staticTexts["Vui lòng nhập số điện thoại và mật khẩu."].exists)
    }
}
