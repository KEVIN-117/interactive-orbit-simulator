import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync, readFileSync } from "node:fs";
import {
  GALLERY_OBJECTS,
  GALLERY_CATEGORIES,
  GALLERY_MOONS,
  filterGallery,
  galleryById,
} from "../src/lib/gallery";

test("the collection covers all requested subjects and eight solar-system planets", () => {
  assert.equal(GALLERY_OBJECTS.length, 16);
  assert.equal(new Set(GALLERY_OBJECTS.map((object) => object.id)).size, 16);
  assert.equal(filterGallery("planets", "").length, 8);
  for (const category of GALLERY_CATEGORIES.filter(
    (category) => category.id !== "all",
  ))
    assert.ok(filterGallery(category.id, "").length >= 2);
});
test("search handles accents, plural categories and multiple words", () => {
  assert.equal(filterGallery("all", "  JUPITER  ")[0].id, "jupiter");
  assert.equal(filterGallery("all", "pilares creacion")[0].id, "pillars");
  assert.equal(filterGallery("all", "enanas blancas").length, 2);
  assert.equal(filterGallery("all", "agujeros negros").length, 2);
  assert.equal(filterGallery("all", "TITAN")[0].id, "saturn");
  assert.equal(filterGallery("all", "no existe este objeto").length, 0);
});
test("category, saved objects and text filters compose without exposing other entries", () => {
  assert.deepEqual(
    filterGallery("galaxies", "", true, ["saturn", "whirlpool"]).map(
      (object) => object.id,
    ),
    ["whirlpool"],
  );
  assert.equal(filterGallery("all", "", true, []).length, 0);
  assert.equal(filterGallery("blackholes", "hubble").length, 0);
});
test("every featured image and moon texture is local and present for offline use", () => {
  const paths = new Set([
    ...GALLERY_OBJECTS.map((object) => object.image),
    ...Object.values(GALLERY_MOONS)
      .flat()
      .map((moon) => moon.texture),
  ]);
  for (const path of paths) {
    assert.ok(path.startsWith("/"), "Assets must not depend on a remote host");
    const file = new URL(`../public${path}`, import.meta.url);
    assert.ok(existsSync(file), `Missing asset: ${path}`);
    assert.ok(statSync(file).size > 1000, `Unexpectedly small asset: ${path}`);
  }
});
test("scientific imagery distinguishes observations from simulations and cites sources", () => {
  for (const object of GALLERY_OBJECTS) {
    assert.ok(
      object.credit &&
        object.source.startsWith("https://") &&
        object.imageNote.length > 40,
    );
  }
  assert.match(galleryById("blackhole").imageType, /Visualización/);
  assert.match(galleryById("m87").imageType, /radio/);
  assert.match(galleryById("sirius").imageNote, /Sirius A/);
  assert.match(galleryById("helix").imageNote, /ultravioleta/);
});
test("download manifest records provenance for every gallery file", () => {
  const sources = JSON.parse(
    readFileSync(
      new URL("../public/gallery/sources.json", import.meta.url),
      "utf8",
    ),
  ) as { file: string; source: string; image: string }[];
  const galleryFiles = [
    ...GALLERY_OBJECTS.map((o) => o.image),
    ...Object.values(GALLERY_MOONS)
      .flat()
      .map((m) => m.texture),
  ].filter((path) => path.startsWith("/gallery/"));
  for (const file of galleryFiles)
    assert.ok(
      sources.some(
        (source) =>
          `/gallery/${source.file}` === file &&
          source.source.startsWith("https://") &&
          source.image.startsWith("https://"),
      ),
      `Missing credit: ${file}`,
    );
});
