import { expect, test } from "@playwright/test";

test("accueil → studio → lecteur élève → quiz", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Une leçon/i })).toBeVisible();
  await page.getByRole("button", { name: "La photosynthèse", exact: true }).click();
  await page.getByRole("button", { name: "Générer la vidéo" }).click();

  await expect(page).toHaveURL(/\/p\//, { timeout: 20_000 });
  await expect(page.getByTestId("version")).toContainText("Version 1", { timeout: 20_000 });
  await expect(page.getByTestId("bande-scenes")).toContainText("Une plante");

  await page.getByRole("button", { name: "Script" }).click();
  await expect(page.getByTestId("script-panel")).toContainText("Quiz · 3 questions");

  await page.getByRole("button", { name: "Partager" }).click();
  const share = await page.getByRole("textbox", { name: "Lien de partage" }).inputValue();
  expect(share).toMatch(/\/v\//);
  await page.getByRole("button", { name: "Fermer" }).click();

  await page.goto(share);
  await expect(page.getByTestId("scene-stage")).toBeVisible();
  await page.getByRole("button", { name: /Mes notes/ }).click();
  await page.getByLabel("Nouvelle note").fill("À revoir avec la classe");
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByTestId("notes")).toContainText("À revoir avec la classe");

  await page.getByTestId("lien-quiz").click();
  for (let i = 0; i < 3; i++) {
    await expect(page.getByTestId("question")).toBeVisible();
    await page.getByRole("group", { name: "Choix de réponse" }).getByRole("button").first().click();
    await page.getByRole("button", { name: "Valider" }).click();
    await expect(page.getByTestId("retour")).toBeVisible();
    await page.getByRole("button", { name: "Question suivante" }).click();
  }
  await expect(page.getByTestId("resultat")).toContainText("Quiz terminé");
  await page.getByRole("button", { name: "Enregistrer mon résultat" }).click();
  await expect(page.getByRole("button", { name: "Résultat enregistré" })).toBeVisible();
});

test("le chat modifie une scène et incrémente la version", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "La photosynthèse", exact: true }).click();
  await page.getByRole("button", { name: "Générer la vidéo" }).click();
  await expect(page).toHaveURL(/\/p\//, { timeout: 20_000 });
  await expect(page.getByTestId("version")).toContainText("Version 1", { timeout: 20_000 });

  await page.getByLabel("Demande une modification").fill("Plus court");
  await page.getByRole("button", { name: "Envoyer la modification" }).click();
  await expect(page.getByTestId("version")).toContainText("Version 2", { timeout: 20_000 });
  await expect(page.getByTestId("chat-thread")).toContainText("raccourci");
});
