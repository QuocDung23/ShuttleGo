import {
  BookingSource,
  BookingStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  ReportStatus,
  UserRole,
  UserStatus,
  VenueStatus,
} from '@/common/enums.js';

const nullableString = { type: 'string', nullable: true };
const nullableId = { type: 'integer', minimum: 1, nullable: true };
const dateTime = { type: 'string', format: 'date-time', nullable: true };
const time = { type: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$' };
const phone = { type: 'string', pattern: '^(0\\d{9}|\\+84\\d{9})$', example: '0901234567' };
const loginPassword = {
  type: 'string',
  minLength: 1,
  maxLength: 72,
  format: 'password',
  writeOnly: true,
};

const userWritable = {
  fullName: { type: 'string', minLength: 1, maxLength: 100 },
  phone,
  password: { type: 'string', minLength: 6, maxLength: 72, format: 'password', writeOnly: true },
  role: { type: 'string', enum: Object.values(UserRole) },
  status: { type: 'string', enum: Object.values(UserStatus) },
  avatarUrl: nullableString,
  fcmToken: { ...nullableString, writeOnly: true },
};

const venueWritable = {
  ownerId: { type: 'integer', minimum: 1 },
  name: { type: 'string', minLength: 1, maxLength: 150 },
  address: { type: 'string', minLength: 1, maxLength: 255 },
  district: { type: 'string', minLength: 1, maxLength: 100 },
  city: { type: 'string', minLength: 1, maxLength: 100 },
  latitude: { type: 'number', minimum: -90, maximum: 90, nullable: true },
  longitude: { type: 'number', minimum: -180, maximum: 180, nullable: true },
  phone: { type: 'string', maxLength: 20, nullable: true },
  description: nullableString,
  coverImageUrl: nullableString,
  weekendSurcharge: { type: 'integer', minimum: 0, default: 0 },
  bankName: { type: 'string', maxLength: 100, nullable: true },
  bankAccountNo: { type: 'string', maxLength: 50, nullable: true },
  bankAccountHolder: { type: 'string', maxLength: 100, nullable: true },
  amenityIds: {
    type: 'array',
    uniqueItems: true,
    items: { type: 'integer', minimum: 1 },
  },
};

const bookingWritable = {
  courtId: { type: 'integer', minimum: 1 },
  playerId: nullableId,
  createdBy: { type: 'integer', minimum: 1, description: 'Ignored; taken from the access token.' },
  source: { type: 'string', enum: Object.values(BookingSource) },
  contactName: { type: 'string', minLength: 1, maxLength: 100 },
  contactPhone: phone,
  bookingDate: { type: 'string', format: 'date', example: '2026-11-20' },
  startTime: { ...time, example: '18:00' },
  endTime: { ...time, example: '20:00' },
  totalAmount: { type: 'integer', minimum: 0, description: 'VND' },
  status: { type: 'string', enum: Object.values(BookingStatus) },
  paymentMethod: { type: 'string', enum: Object.values(PaymentMethod) },
  paymentStatus: { type: 'string', enum: Object.values(PaymentStatus) },
  proofImageUrl: nullableString,
  holdExpiresAt: dateTime,
};

export const openApiSchemas = {
  Error: {
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string' },
      details: { nullable: true },
    },
  },
  PaginationMeta: {
    type: 'object',
    required: ['page', 'limit', 'total', 'totalPages'],
    properties: {
      page: { type: 'integer' },
      limit: { type: 'integer' },
      total: { type: 'integer' },
      totalPages: { type: 'integer' },
    },
  },
  User: {
    type: 'object',
    required: ['id', 'fullName', 'phone', 'role', 'status', 'createdAt', 'updatedAt'],
    properties: {
      id: { type: 'integer' },
      fullName: userWritable.fullName,
      phone,
      role: userWritable.role,
      status: userWritable.status,
      avatarUrl: nullableString,
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  RegisterInput: {
    type: 'object',
    required: ['fullName', 'phone', 'password'],
    properties: {
      fullName: userWritable.fullName,
      phone,
      password: userWritable.password,
      role: { type: 'string', enum: [UserRole.PLAYER, UserRole.OWNER] },
      avatarUrl: userWritable.avatarUrl,
      fcmToken: userWritable.fcmToken,
    },
  },
  LoginInput: {
    type: 'object',
    required: ['phone', 'password'],
    properties: { phone, password: loginPassword },
  },
  AuthResponse: {
    type: 'object',
    required: ['token', 'user'],
    properties: {
      token: { type: 'string' },
      user: { $ref: '#/components/schemas/User' },
    },
  },
  CreateUserInput: {
    type: 'object',
    required: ['fullName', 'phone', 'password'],
    properties: userWritable,
  },
  UpdateUserInput: { type: 'object', properties: userWritable },
  Amenity: {
    type: 'object',
    required: ['id', 'name'],
    properties: { id: { type: 'integer' }, name: { type: 'string', maxLength: 100 } },
  },
  CreateAmenityInput: {
    type: 'object',
    required: ['name'],
    properties: { name: { type: 'string', minLength: 1, maxLength: 100 } },
  },
  UpdateAmenityInput: {
    type: 'object',
    properties: { name: { type: 'string', minLength: 1, maxLength: 100 } },
  },
  Venue: {
    type: 'object',
    required: ['id', 'ownerId', 'name', 'address', 'district', 'city', 'status'],
    properties: {
      id: { type: 'integer' },
      ...Object.fromEntries(
        Object.entries(venueWritable).filter(([key]) => key !== 'amenityIds'),
      ),
      status: { type: 'string', enum: Object.values(VenueStatus) },
      reviewedBy: nullableId,
      reviewedAt: dateTime,
      reviewNote: { type: 'string', maxLength: 500, nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      owner: { $ref: '#/components/schemas/User' },
      amenities: { type: 'array', items: { $ref: '#/components/schemas/Amenity' } },
      courts: { type: 'array', items: { $ref: '#/components/schemas/Court' } },
      operatingHours: { type: 'array', items: { $ref: '#/components/schemas/OperatingHour' } },
      priceRules: { type: 'array', items: { $ref: '#/components/schemas/PriceRule' } },
    },
  },
  CreateVenueInput: {
    type: 'object',
    required: ['name', 'address', 'district', 'city'],
    properties: venueWritable,
  },
  UpdateVenueInput: {
    type: 'object',
    properties: Object.fromEntries(Object.entries(venueWritable).filter(([key]) => key !== 'ownerId')),
  },
  ReviewVenueInput: {
    type: 'object',
    required: ['status', 'reviewedBy'],
    properties: {
      status: { type: 'string', enum: Object.values(VenueStatus) },
      reviewedBy: { type: 'integer', minimum: 1 },
      reviewNote: { type: 'string', maxLength: 500, nullable: true },
    },
  },
  AmenityIdsInput: {
    type: 'object',
    required: ['amenityIds'],
    properties: { amenityIds: venueWritable.amenityIds },
  },
  Court: {
    type: 'object',
    required: ['id', 'venueId', 'name', 'isActive'],
    properties: {
      id: { type: 'integer' },
      venueId: { type: 'integer' },
      name: { type: 'string' },
      isActive: { type: 'boolean' },
    },
  },
  CreateCourtInput: {
    type: 'object',
    required: ['venueId', 'name'],
    properties: {
      venueId: { type: 'integer', minimum: 1 },
      name: { type: 'string', minLength: 1, maxLength: 100 },
      isActive: { type: 'boolean', default: true },
    },
  },
  UpdateCourtInput: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      isActive: { type: 'boolean' },
    },
  },
  OperatingHour: {
    type: 'object',
    required: ['venueId', 'dayOfWeek', 'isOpen'],
    properties: {
      venueId: { type: 'integer' },
      dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
      isOpen: { type: 'boolean' },
      openTime: { ...time, nullable: true },
      closeTime: { ...time, nullable: true },
    },
  },
  UpsertOperatingHourInput: {
    type: 'object',
    properties: {
      isOpen: { type: 'boolean', default: true },
      openTime: { ...time, nullable: true },
      closeTime: { ...time, nullable: true },
    },
  },
  ReplaceOperatingHoursInput: {
    type: 'object',
    required: ['hours'],
    properties: {
      hours: {
        type: 'array',
        maxItems: 7,
        items: {
          allOf: [
            { $ref: '#/components/schemas/UpsertOperatingHourInput' },
            {
              type: 'object',
              required: ['dayOfWeek'],
              properties: { dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 } },
            },
          ],
        },
      },
    },
  },
  PriceRule: {
    type: 'object',
    required: ['id', 'venueId', 'label', 'startTime', 'endTime', 'pricePerHour'],
    properties: {
      id: { type: 'integer' },
      venueId: { type: 'integer' },
      label: { type: 'string' },
      startTime: time,
      endTime: time,
      pricePerHour: { type: 'integer', minimum: 0 },
    },
  },
  CreatePriceRuleInput: {
    type: 'object',
    required: ['venueId', 'label', 'startTime', 'endTime', 'pricePerHour'],
    properties: {
      venueId: { type: 'integer', minimum: 1 },
      label: { type: 'string', minLength: 1, maxLength: 100 },
      startTime: time,
      endTime: time,
      pricePerHour: { type: 'integer', minimum: 0 },
    },
  },
  UpdatePriceRuleInput: {
    type: 'object',
    properties: {
      label: { type: 'string', minLength: 1, maxLength: 100 },
      startTime: time,
      endTime: time,
      pricePerHour: { type: 'integer', minimum: 0 },
    },
  },
  Favorite: {
    type: 'object',
    required: ['userId', 'venueId', 'createdAt'],
    properties: {
      userId: { type: 'integer' },
      venueId: { type: 'integer' },
      venue: { $ref: '#/components/schemas/Venue' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateFavoriteInput: {
    type: 'object',
    required: ['userId', 'venueId'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
      venueId: { type: 'integer', minimum: 1 },
    },
  },
  Booking: {
    type: 'object',
    required: ['id', 'code', 'courtId', 'createdBy', 'bookingDate', 'startTime', 'endTime'],
    properties: {
      id: { type: 'integer' },
      code: { type: 'string' },
      ...bookingWritable,
      paidAt: dateTime,
      cancelReason: { type: 'string', maxLength: 255, nullable: true },
      cancelledBy: nullableId,
      confirmedAt: dateTime,
      cancelledAt: dateTime,
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateBookingInput: {
    type: 'object',
    required: [
      'courtId',
      'contactName',
      'contactPhone',
      'bookingDate',
      'startTime',
      'endTime',
      'totalAmount',
    ],
    properties: bookingWritable,
  },
  UpdateBookingInput: {
    type: 'object',
    properties: {
      ...Object.fromEntries(Object.entries(bookingWritable).filter(([key]) => key !== 'createdBy')),
      cancelReason: { type: 'string', maxLength: 255, nullable: true },
      cancelledBy: nullableId,
    },
  },
  Notification: {
    type: 'object',
    required: ['id', 'userId', 'type', 'title', 'body', 'isRead', 'createdAt'],
    properties: {
      id: { type: 'integer' },
      userId: { type: 'integer' },
      type: { type: 'string', enum: Object.values(NotificationType) },
      title: { type: 'string' },
      body: { type: 'string' },
      bookingId: nullableId,
      isRead: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateNotificationInput: {
    type: 'object',
    required: ['userId', 'type', 'title', 'body'],
    properties: {
      userId: { type: 'integer', minimum: 1 },
      type: { type: 'string', enum: Object.values(NotificationType) },
      title: { type: 'string', minLength: 1, maxLength: 200 },
      body: { type: 'string', minLength: 1 },
      bookingId: nullableId,
      isRead: { type: 'boolean' },
    },
  },
  UpdateNotificationInput: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: Object.values(NotificationType) },
      title: { type: 'string', minLength: 1, maxLength: 200 },
      body: { type: 'string', minLength: 1 },
      bookingId: nullableId,
      isRead: { type: 'boolean' },
    },
  },
  ReadAllNotificationsInput: {
    type: 'object',
    required: ['userId'],
    properties: { userId: { type: 'integer', minimum: 1 } },
  },
  Report: {
    type: 'object',
    required: ['id', 'reporterId', 'content', 'status', 'createdAt'],
    properties: {
      id: { type: 'integer' },
      reporterId: { type: 'integer' },
      bookingId: nullableId,
      venueId: nullableId,
      content: { type: 'string' },
      status: { type: 'string', enum: Object.values(ReportStatus) },
      handledBy: nullableId,
      adminNote: nullableString,
      createdAt: { type: 'string', format: 'date-time' },
      resolvedAt: dateTime,
    },
  },
  CreateReportInput: {
    type: 'object',
    required: ['content'],
    properties: {
      reporterId: { type: 'integer', minimum: 1 },
      bookingId: nullableId,
      venueId: nullableId,
      content: { type: 'string', minLength: 1 },
    },
  },
  UpdateReportInput: {
    type: 'object',
    properties: {
      content: { type: 'string', minLength: 1 },
      status: { type: 'string', enum: Object.values(ReportStatus) },
      handledBy: nullableId,
      adminNote: nullableString,
    },
  },
};
