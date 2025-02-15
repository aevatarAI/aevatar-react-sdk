import type { IStorageSuite } from "@aevatar-react-sdk/types";

export class BaseAsyncStorage implements IStorageSuite {
	public async getItem(key: string) {
		if (typeof localStorage !== "undefined") return localStorage.getItem(key);
	}
	public async setItem(key: string, value: string) {
		if (typeof localStorage !== "undefined")
			return localStorage.setItem(key, value);
	}
	public async removeItem(key: string) {
		if (typeof localStorage !== "undefined")
			return localStorage.removeItem(key);
	}
}
