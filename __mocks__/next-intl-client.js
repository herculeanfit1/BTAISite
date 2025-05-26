module.exports = {
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: jest.fn().mockReturnValue("/"),
  Link: ({ href, children, ...props }) => {
    // Simple mock for Link component
    return { href, children, ...props };
  },
};
