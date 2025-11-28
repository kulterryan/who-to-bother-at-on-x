/// <reference types="vite/client" />

// Declare module for CSS imports with ?url suffix
declare module "*.css?url" {
	const url: string;
	export default url;
}

// Declare module for other asset imports with ?url suffix
declare module "*?url" {
	const url: string;
	export default url;
}
