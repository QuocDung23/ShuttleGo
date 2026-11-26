import Foundation
import XCTest

class ShuttleGoUIFixture: XCTestCase {
    @MainActor func loginScreen() throws -> XCUIApplication {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launch()
        app.open(try XCTUnwrap(URL(string: "ltdd://login")))
        XCTAssertTrue(app.buttons["login-submit"].waitForExistence(timeout: 20))
        return app
    }

    @MainActor func submit(_ app: XCUIApplication, phone: String = "", password: String = "") {
        if !phone.isEmpty {
            let field = app.textFields["login-phone"]
            field.tap()
            for digit in phone {
                field.typeText(String(digit))
            }
            XCTAssertEqual(field.value as? String, phone)
        }
        if !password.isEmpty {
            let field = app.secureTextFields["login-password"]
            field.tap()
            for character in password {
                field.typeText(String(character))
            }
        }
        let button = app.buttons["login-submit"]
        if !button.isHittable {
            app.swipeUp()
        }
        button.tap()
    }

    @MainActor func registrationScreen() throws -> XCUIApplication {
        let app = try loginScreen()
        app.open(try XCTUnwrap(URL(string: "ltdd://register")))
        XCTAssertTrue(app.buttons["register-submit"].waitForExistence(timeout: 15))
        return app
    }

    @MainActor func fillRegistration(
        _ app: XCUIApplication,
        phone: String,
        role: String
    ) throws {
        let name = app.textFields["register-fullName"]
        name.tap()
        name.typeText("XCTest User")

        let phoneField = app.textFields["register-phone"]
        phoneField.tap()
        for digit in phone {
            phoneField.typeText(String(digit))
        }
        XCTAssertEqual(phoneField.value as? String, phone)

        let password = app.secureTextFields["register-password"]
        password.tap()
        for character in "ShuttleGoUITest123" {
            password.typeText(String(character))
        }

        if role == "owner" {
            app.buttons["register-role-owner"].tap()
        } else {
            app.buttons["register-role-player"].tap()
        }
        tapVisible(app.buttons["register-submit"], in: app)
    }

    func fixture(_ key: String) throws -> String {
        if let url = Bundle(for: ShuttleGoUIFixture.self).url(
            forResource: "ShuttleGoUITestData", withExtension: "json"
        ) {
            let values = try JSONDecoder().decode([String: String].self, from: Data(contentsOf: url))
            return try XCTUnwrap(values[key], "Missing fixture key: \(key)")
        }

        if let value = ProcessInfo.processInfo.environment[key], !value.isEmpty {
            return value
        }
        throw XCTSkip("Run npm run seed:uitest and regenerate the XCTest target.")
    }

    @MainActor func signIn(phone: String? = nil) throws -> XCUIApplication {
        let app = try loginScreen()
        let number = try phone ?? fixture("PLAYER_PHONE")
        submit(app, phone: number, password: try fixture("PLAYER_PASSWORD"))
        return app
    }

    @MainActor func openBooking(in app: XCUIApplication) throws {
        let venueId = try fixture("VENUE_ID")
        XCTAssertTrue(app.textFields["Tìm sân theo tên hoặc khu vực"].waitForExistence(timeout: 20))
        app.open(try XCTUnwrap(URL(string: "ltdd://booking?venueId=\(venueId)")))
        XCTAssertTrue(app.staticTexts["Chọn ngày"].waitForExistence(timeout: 20))
    }

    @MainActor func selectBookingDate(_ day: String, in app: XCUIApplication) throws {
        let date = app.descendants(matching: .any)
            .matching(identifier: "booking-date-\(day)").firstMatch
        XCTAssertTrue(date.waitForExistence(timeout: 15))
        tapVisible(date, in: app)
    }

    @MainActor func slot(_ startTime: String, in app: XCUIApplication) throws -> XCUIElement {
        let courtId = try fixture("COURT_ID")
        return app.descendants(matching: .any)
            .matching(identifier: "booking-slot-\(courtId)-\(startTime)").firstMatch
    }

    @MainActor func chooseSlot(_ startTime: String, in app: XCUIApplication) throws {
        let target = try slot(startTime, in: app)
        XCTAssertTrue(target.waitForExistence(timeout: 15), "Missing slot \(startTime)")
        let enabled = XCTNSPredicateExpectation(predicate: NSPredicate(format: "enabled == true"), object: target)
        XCTAssertEqual(XCTWaiter.wait(for: [enabled], timeout: 20), .completed)
        tapVisible(target, in: app)
    }

    @MainActor func proceedToCheckout(in app: XCUIApplication) {
        let placeOrder = app.buttons["Đặt ngay"]
        let enabled = XCTNSPredicateExpectation(
            predicate: NSPredicate(format: "enabled == true"), object: placeOrder
        )
        XCTAssertEqual(XCTWaiter.wait(for: [enabled], timeout: 20), .completed)
        tapVisible(placeOrder, in: app)
        XCTAssertTrue(app.staticTexts["Thanh toán"].waitForExistence(timeout: 20))
    }

    @MainActor func openOwnerSchedule(in app: XCUIApplication) {
        let tab = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-tab").firstMatch
        XCTAssertTrue(tab.waitForExistence(timeout: 20))
        app.open(URL(string: "ltdd://schedule")!)
        XCTAssertTrue(app.staticTexts["Lịch sân"].waitForExistence(timeout: 20))
    }

    @MainActor func tapVisible(_ element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<8 {
            if element.isHittable {
                element.tap()
                return
            }
            let frame = element.frame
            if element.exists && !frame.isEmpty {
                if app.frame.contains(CGPoint(x: frame.midX, y: frame.midY)) {
                    element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
                    return
                }
                if frame.maxX > app.frame.maxX {
                    app.swipeLeft()
                } else if frame.minX < app.frame.minX {
                    app.swipeRight()
                } else if frame.maxY > app.frame.maxY {
                    app.swipeUp()
                } else {
                    app.swipeDown()
                }
            } else {
                app.swipeUp()
            }
        }
        XCTFail("Could not reach \(element)")
    }

    func apiRequest(
        _ path: String,
        method: String = "GET",
        token: String? = nil,
        body: [String: Any]? = nil
    ) async throws -> (status: Int, json: [String: Any]) {
        let base = try fixture("API_BASE_URL").trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        var request = URLRequest(url: try XCTUnwrap(URL(string: "\(base)\(path)")))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        let (data, response) = try await URLSession.shared.data(for: request)
        let http = try XCTUnwrap(response as? HTTPURLResponse)
        let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        return (http.statusCode, json)
    }

    func apiToken(phone: String) async throws -> String {
        let response = try await apiRequest("/auth/login", method: "POST", body: [
            "phone": phone,
            "password": try fixture("PLAYER_PASSWORD"),
        ])
        XCTAssertEqual(response.status, 200, "API login failed: \(response.json)")
        return try XCTUnwrap(response.json["token"] as? String)
    }

    func apiBooking(_ id: String, phone: String) async throws -> [String: Any] {
        let token = try await apiToken(phone: phone)
        let response = try await apiRequest("/bookings/\(id)", token: token)
        XCTAssertEqual(response.status, 200, "Could not read booking #\(id): \(response.json)")
        return response.json
    }

    func apiCreateAndReportPlayerBooking(startTime: String) async throws -> Int {
        let phone = try fixture("PLAYER_PHONE")
        let token = try await apiToken(phone: phone)
        let endHour = (Int(startTime.prefix(2)) ?? 0) + 1
        let endTime = String(format: "%02d:00", endHour)
        let amount = (Int(startTime.prefix(2)) ?? 0) >= 17 ? 120000 : 100000
        let created = try await apiRequest("/bookings", method: "POST", token: token, body: [
            "courtId": Int(try fixture("COURT_ID")) ?? 0,
            "contactName": try fixture("PLAYER_NAME"),
            "contactPhone": phone,
            "bookingDate": try fixture("BOOKING_DATE"),
            "startTime": startTime,
            "endTime": endTime,
            "totalAmount": amount,
            "paymentMethod": "bank_transfer",
        ])
        XCTAssertEqual(created.status, 201, "Could not create realtime fixture booking: \(created.json)")
        let id = try XCTUnwrap(created.json["id"] as? Int)
        let claim = try await apiRequest("/bookings/\(id)", method: "PATCH", token: token, body: [
            "paymentStatus": "pending_verification",
        ])
        XCTAssertEqual(claim.status, 200, "Could not report test transfer: \(claim.json)")
        return id
    }
}
