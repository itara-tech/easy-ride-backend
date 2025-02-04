
declare interface swaggerOptionsType {
	static definition: {
	static openapi: string;

	static info: {
		static title: string;

		static version: string;

		static description: string;

		static contact: {
			static name: string;
		};

		static license: {
			static name: string;

			static url: string;
		};

		static version: string;
	};

	static servers: ({	} | any)[];
	};

	static apis: any[];
}
