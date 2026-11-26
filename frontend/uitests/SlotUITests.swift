import XCTest

final class SlotUITests: ShuttleGoUIFixture {
    @MainActor func testSLOT01ApprovedVenueAppearsInExplore() throws {
        let venue = try fixture("VENUE_NAME")
        let app = try signIn()
        XCTAssertTrue(app.buttons["Đặt sân \(venue)"].waitForExistence(timeout: 20))
    }

    @MainActor func testSLOT02ShowsBothCourts() throws {
        let app = try signIn()
        try openBooking(in: app)
        let courtId = try fixture("COURT_ID")
        let courts = app.descendants(matching: .any)
            .matching(NSPredicate(format: "identifier BEGINSWITH %@", "booking-court-"))
        XCTAssertTrue(courts.matching(identifier: "booking-court-\(courtId)").firstMatch
            .waitForExistence(timeout: 20))
        XCTAssertEqual(courts.count, 2)
    }

    @MainActor func testSLOT03ChangingDateRefreshesAvailability() throws {
        let app = try signIn()
        try openBooking(in: app)
        let bookedDate = try fixture("BOOKING_DATE")
        let alternateDate = try fixture("ALTERNATE_DATE")
        try selectBookingDate(bookedDate, in: app)

        let bookedSlot = try slot("07:00", in: app)
        XCTAssertTrue(bookedSlot.waitForExistence(timeout: 20))
        XCTAssertFalse(bookedSlot.isEnabled, "Seeded booked slot should be unavailable on the first date.")

        try selectBookingDate(alternateDate, in: app)
        let availableSlot = try slot("07:00", in: app)
        let enabled = XCTNSPredicateExpectation(predicate: NSPredicate(format: "enabled == true"), object: availableSlot)
        XCTAssertEqual(XCTWaiter.wait(for: [enabled], timeout: 20), .completed)
    }

    @MainActor func testSLOT04TwoConsecutiveHoursUpdatePriceSummary() throws {
        let app = try signIn()
        try openBooking(in: app)
        try selectBookingDate(fixture("BOOKING_DATE"), in: app)
        let start = try fixture("SLOT_CONSECUTIVE_START")
        let nextHour = String(format: "%02d:00", (Int(start.prefix(2)) ?? 0) + 1)
        try chooseSlot(start, in: app)
        try chooseSlot(nextHour, in: app)

        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "2 giờ"))
            .firstMatch.waitForExistence(timeout: 15))
        XCTAssertTrue(app.staticTexts["\(start) – 17:00"].exists)
        XCTAssertTrue(app.staticTexts["200.000đ"].exists)
    }

    @MainActor func testSLOT05BookedSlotCannotBeSelected() throws {
        let app = try signIn()
        try openBooking(in: app)
        try selectBookingDate(fixture("BOOKING_DATE"), in: app)
        let bookedSlot = try slot("07:00", in: app)
        XCTAssertTrue(bookedSlot.waitForExistence(timeout: 20))
        XCTAssertFalse(bookedSlot.isEnabled)
        XCTAssertTrue(app.staticTexts["Chưa chọn giờ"].exists)
    }

    @MainActor func testSLOT06CannotContinueWithoutSelectingTime() throws {
        let app = try signIn()
        try openBooking(in: app)
        let placeOrder = app.buttons["Đặt ngay"]
        XCTAssertTrue(placeOrder.waitForExistence(timeout: 15))
        XCTAssertFalse(placeOrder.isEnabled)
    }
}
