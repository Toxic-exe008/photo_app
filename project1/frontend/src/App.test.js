import { render, screen } from "@testing-library/react";
import axios from "axios";
import App from "./App";

jest.mock("axios");

beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
});

test("shows the photo gallery and title search", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /my photo gallery/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search photos by title/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter photo title/i)).toBeInTheDocument();
});
