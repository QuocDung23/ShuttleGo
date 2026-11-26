import XCTest

final class OwnerUITests: ShuttleGoUIFixture {
    @MainActor private func openSeededBooking(_ id: String) throws -> (XCUIApplication, XCUIElement) {
        let owner = try fixture("OWNER_PHONE")
        let app = try signIn(phone: owner)
        openOwnerSchedule(in: app)
        let nextDay = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-date-1").firstMatch
        XCTAssertTrue(nextDay.waitForExistence(timeout: 15))
        tapVisible(nextDay, in: app)
        let booking = app.descendants(matching: .any)
            .matching(identifier: "owner-booking-\(id)").firstMatch
        XCTAssertTrue(booking.waitForExistence(timeout: 20))
        return (app, booking)
    }

    @MainActor func testOWN01BookingOccupiesItsCourtAndTime() throws {
        let app = try signIn(phone: fixture("OWNER_PHONE"))
        openOwnerSchedule(in: app)
        let nextDay = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-date-1").firstMatch
        tapVisible(nextDay, in: app)
        XCTAssertTrue(app.descendants(matching: .any)
            .matching(identifier: "owner-booking-\(try fixture("OWNER_BOOKING_ID"))").firstMatch
            .waitForExistence(timeout: 20))
    }

    @MainActor func testOWN02ChangingToEmptyDateClearsPreviousBookings() throws {
        let app = try signIn(phone: fixture("OWNER_PHONE"))
        openOwnerSchedule(in: app)
        let nextDay = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-date-1").firstMatch
        tapVisible(nextDay, in: app)
        let booking = app.descendants(matching: .any)
            .matching(identifier: "owner-booking-\(try fixture("OWNER_BOOKING_ID"))").firstMatch
        XCTAssertTrue(booking.waitForExistence(timeout: 20))

        let emptyDay = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-date-2").firstMatch
        tapVisible(emptyDay, in: app)
        let disappeared = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: booking)
        XCTAssertEqual(XCTWaiter.wait(for: [disappeared], timeout: 15), .completed)
    }

    @MainActor func testOWN03OwnerOpensBookingDetailsFromSchedule() throws {
        let (app, booking) = try openSeededBooking(fixture("OWNER_BOOKING_ID"))
        tapVisible(booking, in: app)
        XCTAssertTrue(app.staticTexts[try fixture("PLAYER_NAME")].waitForExistence(timeout: 15))
        XCTAssertTrue(app.staticTexts["07:00 – 08:00"].exists)
        XCTAssertTrue(app.staticTexts["100.000đ"].exists)
        XCTAssertTrue(app.staticTexts["Đã thanh toán"].exists)
    }

    @MainActor func testOWN04OwnerCanConfirmPendingBooking() async throws {
        let id = try fixture("OWNER_PENDING_BOOKING_ID")
        let (app, booking) = try openSeededBooking(id)
        tapVisible(booking, in: app)
        XCTAssertTrue(app.buttons["Duyệt"].waitForExistence(timeout: 10))
        app.buttons["Duyệt"].tap()

        let result = try await apiBooking(id, phone: fixture("OWNER_PHONE"))
        XCTAssertEqual(result["status"] as? String, "confirmed")
    }

    @MainActor func testOWN05OwnerCanCancelPendingBooking() async throws {
        let id = try fixture("OWNER_CANCEL_BOOKING_ID")
        let (app, booking) = try openSeededBooking(id)
        tapVisible(booking, in: app)
        XCTAssertTrue(app.buttons["Từ chối"].waitForExistence(timeout: 10))
        app.buttons["Từ chối"].tap()

        let result = try await apiBooking(id, phone: fixture("OWNER_PHONE"))
        XCTAssertEqual(result["status"] as? String, "cancelled")
    }

    @MainActor func testOWN06OwnerCanVerifyTransfer() async throws {
        let id = try fixture("OWNER_PAYMENT_BOOKING_ID")
        let (app, booking) = try openSeededBooking(id)
        tapVisible(booking, in: app)
        XCTAssertTrue(app.buttons["Duyệt"].waitForExistence(timeout: 10))
        app.buttons["Duyệt"].tap()

        let result = try await apiBooking(id, phone: fixture("OWNER_PHONE"))
        XCTAssertEqual(result["paymentStatus"] as? String, "paid")
    }

    @MainActor func testOWN09OpenScheduleRefreshesForNewBooking() async throws {
        let app = try signIn(phone: fixture("OWNER_PHONE"))
        openOwnerSchedule(in: app)
        let nextDay = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-date-1").firstMatch
        tapVisible(nextDay, in: app)

        let id = try await apiCreateAndReportPlayerBooking(startTime: fixture("OWNER_REALTIME_SLOT"))
        let booking = app.descendants(matching: .any)
            .matching(identifier: "owner-booking-\(id)").firstMatch
        XCTAssertTrue(booking.waitForExistence(timeout: 25), "Open schedule did not refresh after the player reported payment.")
    }

    @MainActor func testOWN10ScheduleShowsOneBookingAfterAppReconnects() async throws {
        let id = try await apiCreateAndReportPlayerBooking(startTime: fixture("OWNER_RECOVERY_SLOT"))
        let app = try signIn(phone: fixture("OWNER_PHONE"))
        openOwnerSchedule(in: app)
        let nextDay = app.descendants(matching: .any)
            .matching(identifier: "owner-schedule-date-1").firstMatch
        tapVisible(nextDay, in: app)

        let bookingCells = app.descendants(matching: .any)
            .matching(identifier: "owner-booking-\(id)")
        let booking = bookingCells.firstMatch
        XCTAssertTrue(booking.waitForExistence(timeout: 25))
        XCTAssertEqual(bookingCells.count, 1)
    }
}
