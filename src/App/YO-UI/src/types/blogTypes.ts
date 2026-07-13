// Base Props interface matching C# BaseProps
export interface BaseProps {
    IsActive?: boolean;
    IsDeleted?: boolean;
    AddedOn?: string;
    AddedBy?: number;
    ModifiedOn?: string;
    ModifiedBy?: number;
}

// Post interface matching C# Post DTO
export interface Post extends BaseProps {
    PostId?: number;
    Title?: string;
    Url?: string;
    ThumbnailImage?: string;
    CoverImage?: string;
    Content?: string;
    Tags?: string;
    Categories?: string;
    PostAuthorId?: number;
    ViewCount?: number;
    PublishedOn?: string;
    IsVideoContent?: boolean;
    VideoLink?: string;
    RecommendationMetaTags?: string;
    IsPublic?: boolean;
    RowTotal?: number;
    // SEO Properties flattened for convenience or part of the object?
    // Based on C# SavePostViewModel : SEO, the properties are flattened on the ViewModel
    // but typically separated in types if helpful. However, user showed SavePostViewModel : SEO
    // which implies inheritance / flattening in the API response/request mostly.
    // Let's check how the form will send it. SavePostViewModel has all props.
    // So we add SEO props to Post as well.
    MetaTitle?: string;
    MetaKeyWords?: string;
    MetaDescription?: string;
    SeoType?: string;
    LastUrl?: string;
    PageId?: number;
    PageName?: string;
    Image?: string;
    ProductId?: number;
}



// Post save request
export interface PostSaveRequest {
    postId?: number; // long
    title: string; // [Required]
    url: string; // [Required]
    thumbnailImage?: string;
    coverImage?: string;
    content: string; // [Required]
    tags?: string;
    categories?: string;
    postAuthorId?: number;
    viewCount?: number;
    publishedOn?: string;
    // rowTotal is [IgnoreAll]
    // thumbnailImageFile, coverImageFile are [IgnoreAll]
    // isNew, oldUrl, isVideoContent, videoLink, recommendationMetaTags, isPublic
    isNew?: boolean;
    oldUrl?: string;
    isVideoContent?: boolean;
    videoLink?: string;
    recommendationMetaTags?: string;
    isPublic?: boolean;

    // SEO properties from inherited SEO class
    // SEOId key
    seoId?: number;
    metaTitle?: string; // [Required]
    metaKeyWords?: string;
    metaDescription?: string; // [Required]
    seoType?: string; // [Required]
    // imageFile ignored
    lastUrl?: string;
    // url is already there
    pageId?: number;
    pageName?: string;
    image?: string;
    productId?: number;
    isActive?: boolean; // defined in SEO
    isDeleted?: boolean; // defined in SEO
}

// PostCategory interface matching C# PostCategory DTO
export interface PostCategory extends BaseProps {
    PostCategoryId?: number;
    Name?: string;
    Url?: string;
    RowTotal?: number;
}

// PostCategory save request
export interface PostCategorySaveRequest {
    postCategoryId?: number;
    name: string;
    url: string;
    isActive?: boolean;
}

// PostSetting interface matching C# PostSetting DTO
export interface PostSetting {
    PostSettingId?: number;
    RecentPostPerPage?: number;
    RecentPostPerRow?: number;
    UseNextPrev?: boolean;
    ShowDescriptionInRecentPost?: boolean;
    ShowDescriptionInLine?: number;
}

// PostSetting save request
export interface PostSettingSaveRequest {
    postSettingId?: number;
    recentPostPerPage: number;
    recentPostPerRow: number;
    useNextPrev: boolean;
    showDescriptionInRecentPost: boolean;
    showDescriptionInLine: number;
}

export interface ApiResponse<T> {
    Code: number;
    Message: string;
    Data: T;
    Errors?: string[];
}

export interface BlogListQuery {
    offset?: number;
    limit?: number;
    query?: string;
    categoryId?: number;
    isPublic?: boolean;
}
