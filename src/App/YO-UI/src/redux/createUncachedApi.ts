import { createApi as rtkCreateApi } from "@reduxjs/toolkit/query/react";

export const createApi: typeof rtkCreateApi = ((config: any) =>
  rtkCreateApi({
    keepUnusedDataFor: 0,
    refetchOnMountOrArgChange: true,
    ...config,
  })) as any;
