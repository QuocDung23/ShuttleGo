import XCTest

final class BookingUITests: ShuttleGoUIFixture {
    @MainActor func testBOOK01CheckoutSummaryMatchesSelectedSlot() throws {
        let app = try signIn()
        try openBooking(in: app)
        try selectBookingDate(fixture("BOOKING_DATE"), in: app)
        try chooseSlot(fixture("BOOKING_SUMMARY_SLOT"), in: app)
        proceedToCheckout(in: app)

        XCTAssertTrue(app.staticTexts[try fixture("VENUE_NAME")].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["12:00 – 13:00"].exists)
        XCTAssertTrue(app.staticTexts["100.000đ"].exists)
    }

    @MainActor func testBOOK02SubmittedBookingAppearsOnceInHistory() throws {
        let app = try signIn()
        try openBooking(in: app)
        try selectBookingDate(fixture("BOOKING_DATE"), in: app)
        try chooseSlot(fixture("BOOKING_HISTORY_SLOT"), in: app)
        proceedToCheckout(in: app)

        let transfer = app.buttons["Tôi đã chuyển khoản"]
        XCTAssertTrue(transfer.waitForExistence(timeout: 15))
        tapVisible(transfer, in: app)
        XCTAssertTrue(app.staticTexts["Chi tiết đơn"].waitForExistence(timeout: 15))

        app.open(try XCTUnwrap(URL(string: "ltdd://my-bookings")))
        let bookingCards = app.buttons.matching(
            NSPredicate(format: "label CONTAINS %@", "13:00")
        )
        let bookingCard = bookingCards.firstMatch
        XCTAssertTrue(bookingCard.waitForExistence(timeout: 20))
        XCTAssertTrue(bookingCard.label.contains("Chờ chủ sân xác nhận"))
        XCTAssertEqual(bookingCards.count, 1)
    }

    @MainActor func testBOOK09TransferClaimAwaitsOwnerVerification() throws {
        let day = try fixture("BOOKING_DATE")
        let start = try fixture("SLOT_START")
        let app = try signIn()

        try openBooking(in: app)
        try selectBookingDate(day, in: app)
        try chooseSlot(start, in: app)
        proceedToCheckout(in: app)

        let transfer = app.buttons["Tôi đã chuyển khoản"]
        XCTAssertTrue(transfer.waitForExistence(timeout: 15))
        tapVisible(transfer, in: app)
        XCTAssertTrue(app.staticTexts["Chi tiết đơn"].waitForExistence(timeout: 20))
        app.open(try XCTUnwrap(URL(string: "ltdd://my-bookings")))
        let end = String(format: "%02d:00", (Int(start.prefix(2)) ?? 0) + 1)
        let bookingCard = app.buttons.matching(NSPredicate(
            format: "label CONTAINS %@ AND label CONTAINS %@",
            "\(start) – \(end)", "Chờ chủ sân xác nhận"
        )).firstMatch
        XCTAssertTrue(bookingCard.waitForExistence(timeout: 20))
    }
}
