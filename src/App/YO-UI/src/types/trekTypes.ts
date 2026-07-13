
export interface TrekCategorySaveRequest {
    trekCategoryId: number; // 0 or missing/0 => insert, >0 => update
    name: string;
    description: string;
    isActive: boolean;
}

export interface TrekCategory {
    trekCategoryId: number;
    name: string;
    description: string;
    isActive: boolean;
    // add more if you ever need audit fields on FE:
    // isDeleted: boolean;
    // addedOn: string;
    // ...
}

export interface TrekRegionSaveRequest {
    trekRegionId: number;
    name: string;
    description: string;
    isActive: boolean;
}

export interface TrekRegion {
    trekRegionId: number;
    name: string;
    description: string;
    isActive: boolean;
}
export interface AccessibilitySaveRequest {
    accessibilityId?: number;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface ActivityLevelSaveRequest {
    activityLevelId?: number;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface ActivityTypeSaveRequest {
    activityTypeId?: number;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface BookingBasicSaveRequest {
    bookingId?: number;
    userId?: number;
    trekId?: number;
    trekDepartureId?: number;
    productType: string;
    productId?: number;
    adult?: number;
    children?: number;
    preferedStartDate?: string | null;
    arrivalDate?: string | null;
    departureDate?: string | null;
    bookingDate?: string;
    firstName: string;
    middleName?: string;
    lastName?: string;
    gender?: string;
    dob?: string | null;
    nationality?: string;
    email?: string;
    homePhoneNumber?: string;
    workPhoneNumber?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    modeOfPayment?: string;
    paymentReference?: string;
    totalAmount?: number;
    currency?: string;
    flightName?: string;
    flightNumber?: string;
    airportPickUp?: boolean;
    specialRequest?: string;
    specialRequests?: string;
    bookingStatus?: string;
}

export interface BookingChangeStatusRequest {
    bookingId?: number;
    newStatus: string;
    cancelReason?: string;
}

export interface BookingChangeTravelDateRequest {
    bookingId?: number;
    preferedStartDate?: string | null;
    arrivalDate?: string | null;
    departureDate?: string | null;
}

export interface BookingEmergencyContactSaveRequest {
    emergencyContactId?: number;
    bookingId?: number;
    firstName: string;
    middleName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    relationShip?: string;
    email?: string;
    homePhoneNumber?: string;
    personalNumber?: string;
}

export interface BookingHealthInfoSaveRequest {
    bookingHealthInfoId?: number;
    bookingTravellerId?: number;
    medicalConditions?: string;
    allergies?: string;
    fitnessLevel?: string;
    insuranceProvider?: string;
    insurancePolicyNo?: string;
    emergencyNotes?: string;
}

export interface BookingTravellerSaveRequest {
    bookingTravellerId?: number;
    bookingId?: number;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dob?: string | null;
    nationality?: string;
    passportNumber?: string;
    passportIssuedDate?: string | null;
    passportExpiryDate?: string | null;
    travellerType: string;
}

export interface BookingDetail {
    BookingId?: number;
    BookingStatus?: string;
    PaymentStatus?: string;
    ProductType?: string;
    ProductId?: number;
    ProductName?: string;
    TrekName?: string;
    ContactName?: string;
    ContactEmail?: string;
    ContactPhone?: string;
    StartDate?: string;
    EndDate?: string;
    Adults?: number;
    Children?: number;
    TotalAmount?: number;
    PaidAmount?: number;
    DueAmount?: number;
    BookingDate?: string;
    SpecialRequest?: string;
    CancellationReason?: string;
}


export interface CitySaveRequest {
    cityId?: number;
    countryId?: number;
    name?: string;
    stateProvince?: string;
    latitude?: number;
    longitude?: number;
    isSystem?: boolean;
    isActive?: boolean;
}

export interface CurrencySaveRequest {
    currencyId?: number;
    code?: string;
    name?: string;
    symbol?: string;
    decimalPlaces?: number;
    isSystem?: boolean;
    isActive?: boolean;
}

export interface EquipmentCategorySaveRequest {
    equipmentCategoryId?: number;
    name?: string;
    description?: string;
    tag?: string;
    isActive?: boolean;
}

export interface EquipmentSaveRequest {
    equipmentId?: number;
    equipmentCategoryId?: number;
    name?: string;
    description?: string;
    tag?: string;
    isActive?: boolean;
}

export interface InExServiceSaveRequest {
    inExServiceId?: number;
    name?: string;
    description?: string;
    isIncluded?: boolean;
    isActive?: boolean;
}

export interface ItinerarySaveRequest {
    itineraryId?: number;
    dayNumber?: number;
    dayTitle?: string;
    startLocation?: string;
    overnightLocation?: string;
    startLocationId?: number;
    endLocationId?: number;
    trekTimeHours?: string;
    trekDistanceKM?: number;
    transportMethod?: string;
    accommodationType?: string;
    mealsIncluded?: string;
    dailyActivityDetails?: string;
}

export interface PermitSaveRequest {
    permitId?: number;
    permitName?: string;
    fullPermitName?: string;
    costNPR?: number;
    costUSD?: number;
    requiredDocument?: string;
    agencyHandles?: boolean;
    agencyContactNo?: string;
    agencyContactPerson?: string;
    agencyContantEmail?: string;
}

export interface TourTypeSaveRequest {
    tourTypeId?: number;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface TrekBasicSaveRequest {
    trekId?: number;
    trekCategoryId?: number;
    trekRegionId?: number;
    name?: string;
    url?: string;
    description?: string;
    activityTypeId?: number;
    activityLevelId?: number;
    durationDays?: number;
    priceInUSD?: number;
    priceInNrs?: number;
    maxAltitudeMeters?: number;
    maxAltitudeFeet?: number;
    startingPoint?: string;
    endingPoint?: string;
    overviewDescription?: string;
    baseAccommodationType?: string;
    startCityId?: number;
    endCityId?: number;
    defaultCurrencyId?: number;
    trekMap?: string;
    isVerified?: boolean;
    isSystem?: boolean;
    isActive?: boolean;
    destinationId?: number;
    isPopular?: boolean;
    isTrending?: boolean;
}

export interface BookingDashboardSummaryDto {
    TodayBookings: number;
    TodayAmount: number;
    ThisMonthBookings: number;
    ThisMonthAmount: number;
    TotalBookings: number;
    TotalAmount: number;
    PendingPaymentsCount: number;
    PendingPaymentsAmount: number;
}


export interface TrekDepartureSaveRequest {
    trekDepartureId?: number;
    startDate?: string;
    endDate?: string;
    seatsTotal?: number;
    seatsSold?: number;
    basePrice?: number;
    currencyId?: number;
    closed?: boolean;
}

export interface TrekFAQSaveRequest {
    trekFAQId?: number;
    category?: string;
    question?: string;
    solution?: string;
    priority?: number;
}

export interface TrekGuideSaveRequest {
    trekAvailableGuideId?: number;
    guideId?: number;
    isRecommended?: boolean;
}

export interface TrekHighLightSaveRequest {
    trekHighLightId?: number;
    description?: string;
    displayOrder?: number;
}

export interface TrekImageSaveRequest {
    trekImageId?: number;
    imagePath?: string;
    isLandscape?: boolean;
    isBannerType?: boolean;
    isVertical?: boolean;
}

export interface TrekInclusionExclusionSaveRequest {
    trekInclusionExclusionId?: number;
    description?: string;
    isIncluded?: boolean;
    isOptional?: boolean;
    optionalCostDetails?: string;
}

export interface TrekRecommendedSessionSaveRequest {
    trekRecommendedSessionId?: number;
    trekSessionId?: number;
}

export interface TrekReviewSaveRequest {
    trekReviewId?: number;
    star?: number;
    review?: string;
    reviewedByName?: string;
    isApproved?: boolean;
}

export interface TrekWhyUsSaveRequest {
    trekWhyUsId?: number;
    description?: string;
    displayOrder?: number;
}

export interface TrekEquipmentSaveRequest {
    equipmentId?: number;
    description?: string;  // optional field (notes/description)
    isOptional?: boolean;
    isRequired?: boolean;
    qty?: number;  // optional field, default 1
}

export interface TrekMapSaveRequest {
    trekMapId?: number;
    title?: string;
    imageUrl?: string;
    iframeUrl?: string;
    mapId?: number;
    imageFile?: File;
}

// Common params
export interface PaginationParams {
    offset?: number;
    limit?: number;
    query?: string;
}

export interface ApiResponse<T> {
    Code: number;
    Message: string;
    Data: T;
    Errors: string[];
}


export interface BannerSaveRequest {
    bannerId?: number;
    name?: string;
    key?: string;
    isActive?: boolean;
}

export interface Banner {
    BannerId: number;
    Name: string;
    Key: string;
    IsActive: boolean;
    UpdatedDate?: string;
    RowTotal?: number;
}

export interface BannerItemSaveRequest {
    bannerItemId?: number;
    bannerId?: number;
    heading?: string;
    subheading?: string;
    ctaText?: string;
    ctaLink?: string;
    imageUrl?: string;
    secondaryImageUrl?: string;
    animation?: string;
    contentPosition?: string;
    overlayOpacity?: number;
    displayOrder?: number;
    isActive?: boolean;
    ImageFile?: File;
}

export interface BannerItem {
    BannerItemId: number;
    BannerId: number;
    Heading: string;
    SubHeading: string;
    CTAText: string;
    CTALink: string;
    ImageUrl: string;
    SecondaryImageUrl: string;
    Animation: string; // 'fade' | 'slide-up' | 'zoom-in' | 'slide-right'
    ContentPosition: string; // 'left' | 'center' | 'right'
    OverlayOpacity: number;
    DisplayOrder: number;
    IsActive: boolean;
    IsImageDirectUrl: boolean;
}

export interface TestimonialSaveRequest {
    id?: number;
    name?: string;
    designation?: string;
    company?: string;
    description?: string;
    rating?: number;
    thumbnailImage?: string;
    isActive?: boolean;
    thumbnailFile?: File;
    url?: string;
    showInHome?: boolean;
    isApproved?: boolean;
}

export interface Testimonial {
    Id: number;
    Name: string;
    ThumbnailImage?: string;
    Description?: string;
    ShortDescription?: string;
    Designation?: string;
    Email?: string;
    Url?: string; // Was Company?
    ShowInHome?: boolean;
    IsApproved?: boolean;
    IsActive: boolean;
    RowTotal?: number;
    Rating?: number; // keeping this just in case, though not in example
    Company?: string;
}

export interface NewsArticleSaveRequest {
    NewsArticleId?: number;
    NewsCategoryId?: number;
    Title?: string;
    Slug?: string;
    Summary?: string;
    Body?: string;
    ThumbnailUrl?: string;
    FeaturedImageUrl?: string;
    PublishDate?: string;
    IsActive?: boolean;
    ThumbnailFile?: File;
    FeaturedImageFile?: File;
}

export interface NewsArticle {
    NewsArticleId: number;
    NewsCategoryId: number;
    NewsCategoryName?: string;
    Title: string;
    Slug: string;
    Summary: string;
    Body: string;
    ThumbnailUrl: string;
    FeaturedImageUrl: string;
    PublishDate: string;
    IsActive: boolean;
    RowTotal?: number;
}

export interface NewsCategorySaveRequest {
    NewsCategoryId?: number;
    Name?: string;
    Description?: string;
    DisplayOrder?: number;
    IsActive?: boolean;
}

export interface NewsCategory {
    NewsCategoryId: number;
    Name: string;
    Description: string;
    DisplayOrder: number;
    IsActive: boolean;
    RowTotal?: number;
}

export interface NewsSettingSaveRequest {
    NewsSettingId?: number;
    SettingName?: string;
    DisplayRows?: number;
    DisplayColumns?: number;
    ItemsPerPage?: number;
    ShowAuthor?: boolean;
    ShowPublishDate?: boolean;
    EnableComments?: boolean;
}

export interface NewsSetting {
    NewsSettingId: number;
    SettingName: string;
    DisplayRows: number;
    DisplayColumns: number;
    ItemsPerPage: number;
    ShowAuthor: boolean;
    ShowPublishDate: boolean;
    EnableComments: boolean;
}
