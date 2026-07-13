import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

export const miscAPI = createApi({
    reducerPath: "miscAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["miscAPI"],
    endpoints: (builder) => ({
        getAllCountries: builder.query<any, any>({
            query: (params) => ({
                url: API.MISC.COUNTRY_ALL,
                method: "GET",
                params,
            }),
            providesTags: ["miscAPI"],
        }),
    }),
});

export const {
    useGetAllCountriesQuery
} = miscAPI;
