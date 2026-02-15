import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TopicInput from "@/components/TopicInput";

describe("TopicInput", () => {
  it("renders the input field and submit button", () => {
    render(<TopicInput onSearch={() => {}} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it("does not call onSearch with empty input", () => {
    const onSearch = vi.fn();
    render(<TopicInput onSearch={onSearch} />);

    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.submit(form);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("calls onSearch with the entered topic text on form submit", () => {
    const onSearch = vi.fn();
    render(<TopicInput onSearch={onSearch} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "immigration policy" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    expect(onSearch).toHaveBeenCalledWith("immigration policy");
  });

  it("disables the button when input is empty or whitespace", () => {
    render(<TopicInput onSearch={() => {}} />);

    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeDisabled();
  });

  it("shows loading state when isLoading prop is true", () => {
    render(<TopicInput onSearch={() => {}} isLoading={true} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();

    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });
});
