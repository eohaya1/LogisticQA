import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";

describe("TrenchReady App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the initial overview with all 4 workout pillars, sets/reps, eating habits, and drills staging", () => {
    // Arrange & Act
    render(<App />);

    // Assert
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /trenchready — hs defensive lineman training/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Upper Body" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Lower Body" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Explosive Days" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Running Days" }),
    ).toBeInTheDocument();

    expect(screen.getByText("4 × 5-6")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /healthy eating habits/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /position drills \(add later\)/i }),
    ).toBeInTheDocument();
  });

  it("navigates to workouts, filters to Explosive Days, and marks an exercise complete", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<App />);

    // Act
    await user.click(screen.getByRole("tab", { name: /workouts/i }));
    await user.click(screen.getByRole("button", { name: "Explosive Days" }));

    // Assert filtered view
    expect(
      screen.getByRole("heading", { name: "Explosive Days" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Upper Body" }),
    ).not.toBeInTheDocument();

    // Toggle exercise completion
    const cleanBtn = screen.getByRole("button", {
      name: /hang power clean/i,
    });
    await user.click(cleanBtn);
    expect(cleanBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles healthy eating habits on the Healthy Eating tab", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<App />);

    // Act
    await user.click(screen.getByRole("tab", { name: /healthy eating/i }));
    const hydrationBtn = screen.getByRole("button", {
      name: /hit 80-100 oz of water/i,
    });
    await user.click(hydrationBtn);

    // Assert
    expect(hydrationBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("prevents submitting an empty drill and adds/removes a valid custom drill", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /drills/i }));

    const submitBtn = screen.getByRole("button", { name: /add drill/i });
    expect(submitBtn).toBeDisabled();

    // Act
    await user.type(screen.getByLabelText(/drill name/i), "Med Ball Punch Shed");
    await user.type(
      screen.getByLabelText(/sets \/ reps or duration/i),
      "4 sets × 6 reps",
    );
    await user.type(
      screen.getByLabelText(/coaching cue/i),
      "Violent thumbs-up lockout",
    );
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    // Assert added drill
    expect(
      screen.getByText(/added "med ball punch shed" to your drill list/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Med Ball Punch Shed")).toBeInTheDocument();

    // Remove drill
    await user.click(
      screen.getByRole("button", { name: /remove med ball punch shed/i }),
    );
    expect(screen.queryByText("Med Ball Punch Shed")).not.toBeInTheDocument();
  });

  it("surfaces a recoverable warning when saved localStorage data is corrupted", async () => {
    // Arrange
    window.localStorage.setItem("trench-ready.progress.v1", "{bad-json");
    const user = userEvent.setup();

    // Act
    render(<App />);

    // Assert two-audience warning
    const alert = screen.getByRole("alert");
    expect(
      within(alert).getByText(
        /saved progress on this browser could not be loaded cleanly/i,
      ),
    ).toBeInTheDocument();

    await user.click(
      within(alert).getByRole("button", { name: /reset saved progress/i }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
