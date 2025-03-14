import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/router", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
		query: {},
	}),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
	useSession: jest.fn(() => ({
		data: null,
		status: "unauthenticated",
	})),
	signIn: jest.fn(),
	signOut: jest.fn(),
}));

// Mock Recoil
jest.mock("recoil", () => ({
	...jest.requireActual("recoil"),
	useRecoilState: jest.fn(),
	useRecoilValue: jest.fn(),
	useSetRecoilState: jest.fn(),
}));

// Mock Pusher
jest.mock("pusher-js", () => {
	return jest.fn().mockImplementation(() => ({
		subscribe: jest.fn().mockReturnValue({
			bind: jest.fn(),
			unbind: jest.fn(),
		}),
		unsubscribe: jest.fn(),
		disconnect: jest.fn(),
	}));
});

// Reset all mocks before each test
beforeEach(() => {
	jest.clearAllMocks();
});
