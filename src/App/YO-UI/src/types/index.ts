import { Dispatch, SetStateAction } from "react";
import {
  Control,
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";

export interface ITokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}
export interface ITokenInfo {
  IdUid: string;
  amr: string[];
  aud: string;
  auth_time: number;
  client_id: string;
  dob: string;
  email: string;
  exp: number;
  firstname: string;
  iat: number;
  idp: string;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  role: string[];
  scope: string[];
  sub: string;
  surname: string;
  use: string;
  username: string;
}
export interface IFilterList {
  key: string;
  value: string;
  type?: "text" | "date";
}
export interface FilterProps<T extends FieldValues> {
  register?: UseFormRegister<T>;
  control?: Control<T>;
  handleSubmit: UseFormHandleSubmit<T>;
  onFilterSubmit: SubmitHandler<T>;
  handleFilterReset: () => void;
  handleFilterRemove: (key: string) => void;
  handleFilterSearch: (s: string) => void;
  filterList: IFilterList[];
  setFilter?: Dispatch<SetStateAction<IFilterList[]>>;
}