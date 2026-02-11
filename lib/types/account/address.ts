export type UserAddress = {
  id: string;
  user_id: string;
  created_at: string;
  address_nickname: string | null;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};


export  type AddressPayload = Omit<UserAddress, "id" | "user_id" | "created_at">;
