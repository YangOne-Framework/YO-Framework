import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { authAPI } from "./user/authAPI";
import { userAPI } from "./user/userAPI";
import { menuAPI } from "./menu/menuAPI";
import { aiAssistantAPI } from "./aibot/aiAssistantAPI";
import { categoryAPI } from "./aibot/categoryAPI";
import { collectionAPI } from "./aibot/collectionAPI";
import { knowledgeBaseAPI } from "./aibot/knowledgebaseAPI";
import { llmProviderAPI } from "./aibot/llmProviderAPI";
import { moderationAPI } from "./aibot/moderationAPI";
import { systemPromptAPI } from "./aibot/systemPromptAPI";
import { themeAPI } from "./aibot/themeAPI";
import { supportAPI } from "./admin/SupportTicketAPI";
import { settingAPI } from "./setting/settingAPI";
import { mediaLibraryAPI } from "./setting/medialibraryAPI";
import { localizationAPI } from "./setting/localizationAPI";
import { permissionAPI } from "./setting/permissionAPI";
import { moduleAPI } from "./setting/moduleAPI";
import { htmlBuilderAPI } from "./htmlbuilder/htmlBuilderAPI";
import { openIddictAdminAPI } from "./setting/clientAPI";
import { seoAPI } from "./seo/seoAPI";
import { miscAPI } from "./other/miscAPI";
import { timezoneAPI } from "./timezone/timezoneAPI";
import { emailApi } from "./email/emailAPI";
import { smsApi } from "./sms/smsAPI";
import { emailTemplateApi } from "./email/emailTemplateAPI";
import { restrictionAPI } from "./restriction/restrictionAPI";
import { layoutAPI } from "./layout/layoutAPI";
import { yoPageAPI } from "./cmspage/cmsPageAPI";
import { publicPageAPI } from "./publicPage/publicPageAPI";


export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    [userAPI.reducerPath]: userAPI.reducer,
    [menuAPI.reducerPath]: menuAPI.reducer,
    [aiAssistantAPI.reducerPath]: aiAssistantAPI.reducer,
    [categoryAPI.reducerPath]: categoryAPI.reducer,
    [collectionAPI.reducerPath]: collectionAPI.reducer,
    [knowledgeBaseAPI.reducerPath]: knowledgeBaseAPI.reducer,
    [llmProviderAPI.reducerPath]: llmProviderAPI.reducer,
    [moderationAPI.reducerPath]: moderationAPI.reducer,
    [systemPromptAPI.reducerPath]: systemPromptAPI.reducer,
    [themeAPI.reducerPath]: themeAPI.reducer,
    [supportAPI.reducerPath]: supportAPI.reducer,
    [settingAPI.reducerPath]: settingAPI.reducer,
    [mediaLibraryAPI.reducerPath]: mediaLibraryAPI.reducer,
    [localizationAPI.reducerPath]: localizationAPI.reducer,
    [moduleAPI.reducerPath]: moduleAPI.reducer,
    [permissionAPI.reducerPath]: permissionAPI.reducer,
    [htmlBuilderAPI.reducerPath]: htmlBuilderAPI.reducer,
    [openIddictAdminAPI.reducerPath]: openIddictAdminAPI.reducer,
    [seoAPI.reducerPath]: seoAPI.reducer,
    [miscAPI.reducerPath]: miscAPI.reducer,
    [timezoneAPI.reducerPath]: timezoneAPI.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
    [smsApi.reducerPath]: smsApi.reducer,
    [emailTemplateApi.reducerPath]: emailTemplateApi.reducer,
    [restrictionAPI.reducerPath]: restrictionAPI.reducer,
    [layoutAPI.reducerPath]: layoutAPI.reducer,
    [yoPageAPI.reducerPath]: yoPageAPI.reducer,
    [publicPageAPI.reducerPath]: publicPageAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authAPI.middleware,
      userAPI.middleware,
      menuAPI.middleware,
      aiAssistantAPI.middleware,
      categoryAPI.middleware,
      collectionAPI.middleware,
      knowledgeBaseAPI.middleware,
      llmProviderAPI.middleware,
      moderationAPI.middleware,
      systemPromptAPI.middleware,
      themeAPI.middleware,
      supportAPI.middleware,
      settingAPI.middleware,
      mediaLibraryAPI.middleware,
      localizationAPI.middleware,
      moduleAPI.middleware,
      permissionAPI.middleware,
      htmlBuilderAPI.middleware,
      openIddictAdminAPI.middleware,
      seoAPI.middleware,
      miscAPI.middleware,
      timezoneAPI.middleware,
      emailApi.middleware,
      smsApi.middleware,
      emailTemplateApi.middleware,
      restrictionAPI.middleware,
      layoutAPI.middleware,
      yoPageAPI.middleware,
      publicPageAPI.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
