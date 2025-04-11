
declare interface schemasType {
	static payment: {
	static amount: any;

	static phoneNumber: {
		static is: string;

		static then: any[];

		static otherwise: any[];
	};

	static description: any;

	static tripId: any;

	static paymentGateway: any;

	static paymentMethod: {
		static is: string;

		static then: any;

		static otherwise: any;
	};
	};

	static refund: {
	static amount: any;

	static phoneNumber: any[];

	static tripId: any;

	static reason: any;
	};

	static statusCheck: {
	static reference: any[];

	static gateway: any;
	};

	static paymentHistory: {
	static offset: any;

	static limit: any;

	static status: any;

	static gateway: any;
	};

	static webhook: {
	static event: any;

	static data: any;

	static timestamp: any;
	};
}
