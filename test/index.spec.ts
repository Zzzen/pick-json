import { pickJSON } from "../src/index";

describe("test", () => {
  it("foo", () => {
    expect(
      pickJSON(
        JSON.stringify(
          {
            a: {
              c: "d",
              d: "be\nfore",
              true: true,
              false: false,
              null: null,
            },

            arr: [{ x: 1 }, 12, "ffff"],
            f: 23.3,
          },

          null,
          2
        ),

        []
      )
    ).toMatchSnapshot();
  });
});
