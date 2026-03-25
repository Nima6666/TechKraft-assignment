import test from "node:test";
import assert from "node:assert/strict";
import { findCityForSuburb } from "../src/shared/suburbs-by-city";

test.describe("findCityForSuburb", () => {
  test.it("returns city on exact (case-insensitive) suburb match", () => {
    assert.equal(findCityForSuburb("Kapan"), "Kathmandu");
    assert.equal(findCityForSuburb("kapan"), "Kathmandu");
  });

  test.it("returns city when substring uniquely matches one suburb", () => {
    assert.equal(findCityForSuburb("Lakes"), "Pokhara");
  });

  test.it("returns null when suburb cannot be resolved", () => {
    assert.equal(findCityForSuburb("DefinitelyNotASuburb"), null);
  });
});

