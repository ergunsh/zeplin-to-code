const { generateFlexDirection, DIRECTION_ROW, DIRECTION_COLUMN } = require("./index");
const { rowContainerFixture, columnContainerFixture } = require("./fixtures");

describe("Generate flex direction test", () => {
    it("should return DIRECTION_COLUMN for container where its children are laid off as column", () => {
        expect(generateFlexDirection(columnContainerFixture)).toBe(DIRECTION_COLUMN);
    });

    it("should return DIRECTION_ROW for container where its children are laid off as row", () => {
        expect(generateFlexDirection(rowContainerFixture)).toBe(DIRECTION_ROW);
    });
});