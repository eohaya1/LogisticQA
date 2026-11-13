import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";

describe("Trenches Lab UI wiring", () => {
  it("renders initial offseason overview with all four training day categories", () => {
    render(<App />);

    expect(
      screen.getByText(/12-Week High School D-Line Offseason Blueprint/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Upper Body")).toBeInTheDocument();
    expect(screen.getByText("Lower Body")).toBeInTheDocument();
    expect(screen.getByText("Explosive Day")).toBeInTheDocument();
    expect(screen.getByText("Running Day")).toBeInTheDocument();
  });

  it("navigates to Workouts & Drills, switches categories, marks day complete, and adds a custom drill", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: /Workouts & Drills/i }));
    expect(
      screen.getByText(/Day 1: Upper Body — Lockout & Punch Strength/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Explosive Day/i }));
    expect(
      screen.getByText(/Day 3: Explosive Day — Triple Extension/i)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Mark Week 1 Complete/i })
    );
    expect(
      screen.getByRole("button", { name: /Completed \(Week 1\)/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Add Drill/i }));
    await user.type(
      screen.getByLabelText(/Drill Name/i),
      "Ball-Get-Off Rip Drill"
    );
    await user.click(
      screen.getByRole("button", { name: /Save Drill to Explosive Day/i })
    );
    expect(
      screen.getByRole("button", { name: "Delete drill Ball-Get-Off Rip Drill" })
    ).toBeInTheDocument();
  });

  it("switches nutrition goals and checks off healthy eating habits", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: /Meal Plan & Habits/i }));
    expect(
      screen.getByText(/Power Breakfast: Eggs, Oats & Banana/i)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("radio", { name: /Trim Bad Weight & Keep Strength/i })
    );
    expect(
      screen.getByText(/Macro Focus \(Trim Bad Weight & Keep Strength\)/i)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Eat a Real Protein Source at Every Meal/i })
    );
    expect(screen.getByText(/1\/8 completed/i)).toBeInTheDocument();
  });

  it("sets a week-to-week lifting goal and logs a working set", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: /Lifting Goals/i }));

    await user.type(screen.getByLabelText(/Week 1 Start \(lbs\)/i), "155");
    await user.type(screen.getByLabelText(/Week 12 Goal \(lbs\)/i), "210");
    await user.click(
      screen.getByRole("button", { name: /Save Lifting Goal/i })
    );

    expect(
      screen.getByText(/Week 1 Target: 155 lbs × 5 reps/i)
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Weight \(lbs\)/i), "165");
    await user.click(screen.getByRole("button", { name: /Log Lift Result/i }));

    expect(
      screen.getByText(/Week 1: 165 lbs — 4 sets × 5 reps/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Ahead of Goal/i)).toBeInTheDocument();
  });

  it("sets a speed baseline/goal and logs a 40-yard dash attempt", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: /Speed & Combine/i }));
    await user.click(screen.getByRole("tab", { name: /40-Yard Dash/i }));

    await user.type(screen.getByLabelText(/Week 1 Baseline \(sec\)/i), "5.25");
    await user.type(screen.getByLabelText(/Offseason Goal \(sec\)/i), "4.95");
    await user.click(screen.getByRole("button", { name: /Save Speed Goal/i }));

    await user.type(screen.getByLabelText(/Result \(sec\)/i), "4.95");
    await user.click(
      screen.getByRole("button", { name: /Log Speed Result/i })
    );

    expect(screen.getByText(/Goal Hit/i)).toBeInTheDocument();
    expect(screen.getByText(/Improved over baseline/i)).toBeInTheDocument();
  });
});
