/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** 後端 API 根（例：https://api.example.com），不含尾隨斜線 */
	readonly VITE_API_BASE?: string;
}
