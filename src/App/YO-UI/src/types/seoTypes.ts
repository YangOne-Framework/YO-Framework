export interface SeoSaveRequest {
    seoId?: number;
    metaTitle: string;
    metaKeyWords?: string;
    metaDescription: string;
    seoType: string; // product / news / category
    imageFile?: File; // For upload
    lastUrl?: string;
    url: string;
    pageId?: number;
    pageName?: string;
    image?: string; // For display/response
    productId?: number;
    isActive?: boolean;
    isDeleted?: boolean;
}

export interface SeoResponse {
    SEOId: number;
    MetaTitle: string;
    MetaKeyWords: string;
    MetaDescription: string;
    SeoType: string;
    ImageFile: any;
    LastUrl: string;
    Url: string;
    PageId: number;
    PageName: string;
    Image: string;
    ProductId: number;
    IsActive: boolean;
    IsDeleted: boolean;
    AddedOn: string;
    AddedBy: number;
    UpdatedOn: string;
    UpdatedBy: number;
    RowTotal?: number;
}
