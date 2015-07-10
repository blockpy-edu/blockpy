/**
* Module that contains the translation implementation.
* Depends on core.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  JSAV._translations = {
    "en": {
      // animation control button titles
      "backwardButtonTitle": "Backward",
      "forwardButtonTitle": "Forward",
      "beginButtonTitle": "Begin",
      "endButtonTitle": "End",

      "resetButtonTitle": "Reset",
      "undoButtonTitle": "Undo",
      "modelButtonTitle": "Model Answer",
      "gradeButtonTitle": "Grade",

      "modelWindowTitle": "Model Answer",

      "feedbackLabel":"Grading Mode: ",
      "continuous": "Continuous",
      "atend": "At end",

      "fixLabel": "Continuous feedback behaviour",
      "undo": "Undo incorrect step",
      "fix": "Fix incorrect step",

      "scoreLabel": "Score:",
      "remainingLabel": "Points remaining:",
      "lostLabel": "Points lost:",
      "doneLabel": "DONE",

      "yourScore": "Your score:",
      "fixedSteps": "Fixed incorrect steps:",

      "fixedPopup": "Your last step was incorrect. Your work has been replaced with the correct step so that you can continue.",
      "fixFailedPopup": "Your last step was incorrect and I should fix your solution, but don't know how. So it was undone and you can try again.",
      "undonePopup": "Your last step was incorrect. Things are reset to the beginning of the step so that you can try again.",

      "settings": "Settings",
      "animationSpeed" : "Animation speed",
      "(slowFast)": "(slow - fast)",
      "valueBetween1And10": "Value between 1 (Slow) and 10 (Fast).",
      "save": "Save",
      "saved": "Saved...",

      "questionClose": "Close",
      "questionCheck": "Check Answer",
      "questionCorrect": "Correct!",
      "questionIncorrect": "Incorrect"
    },
    "fi": {
      "backwardButtonTitle": "Askel taaksepäin",
      "forwardButtonTitle": "Askel eteenpäin",
      "beginButtonTitle": "Kelaa alkuun",
      "endButtonTitle": "Kelaa loppuun",

      "resetButtonTitle": "Uudelleen",
      "undoButtonTitle": "Kumoa",
      "modelButtonTitle": "Mallivastaus",
      "gradeButtonTitle": "Arvostele",

      "modelWindowTitle": "Mallivastaus",

      "feedbackLabel":"Arvostelumuoto: ",
      "continuous": "Jatkuva",
      "atend": "Lopussa",

      "fixLabel": "Jatkuvan arvostelun asetukset",
      "undo": "Kumoa väärin menneet askeleet",
      "fix": "Korjaa väärin menneet askeleet",

      "scoreLabel": "Pisteet:",
      "remainingLabel": "Pisteitä jäljellä:",
      "lostLabel": "Menetetyt pisteet:",
      "doneLabel": "VALMIS",

      "yourScore": "Sinun pisteesi:",
      "fixedSteps": "Korjatut askeleet:",

      "fixedPopup": "Viime askeleesi meni väärin. Se on korjattu puolestasi, niin että voit jatkaa tehtävää.",
      "fixFailedPopup": "Viime askeleesi meni väärin ja minun tulisi korjata se. En kuitenkaan osaa korjata sitä, joten olen vain kumonnut sen.",
      "undonePopup": "Viime askeleesi meni väärin. Askel on kumottu, niin että voit yrittää uudelleen.",

      "settings": "Asetukset",
      "animationSpeed" : "Animointinopeus",
      "(slowFast)": "(hidas - nopea)",
      "valueBetween1And10": "Anna arvo 1:n (hidas) ja 10:n (nopea) välillä.",
      "save": "Tallenna",
      "saved": "Tallennettu...",

      "questionClose": "Sulje",
      "questionCheck": "Tarkista vastaus",
      "questionCorrect": "Oikein!",
      "questionIncorrect": "Väärin"

    },
    "sv": {
      "resetButtonTitle": "Börja om",
      "undoButtonTitle": "Ångra",
      "modelButtonTitle": "Visa lösning",
      "gradeButtonTitle": "Poängsätt",

      "modelWindowTitle": "Lösning",

      "feedbackLabel":"Rättningsalternativ: ",
      "continuous": "Rätta kontinuerligt",
      "atend": "Poängsätt i slutet",

      "fixLabel": "Alternativ för kontinuerlig rättning",
      "undo": "Ångra felaktigt steg",
      "fix": "Åtgärda felaktigt steg",

      "scoreLabel": "Poäng:",
      "remainingLabel": "Kvarvarande poäng:",
      "lostLabel": "Förlorade poäng:",
      "doneLabel": "FÄRDIG!",

      "yourScore": "Din poäng:",
      "fixedSteps": "Åtgärdade felaktiga steg:",

      "fixedPopup": "Ditt senaste steg var felaktigt. Det har ersatts med det korrekta steget så att du kan fortsätta.",
      "fixFailedPopup": "Ditt senaste steg var felaktigt men jag vet inte hur det bör åtgärdas. Därför har ditt steg ångrats och du kan försöka igen.",
      "undonePopup": "Ditt senaste steg var felaktigt. Steget har ångrats så att du kan försöka igen.",

      "settings": "Inställningar",
      "animationSpeed" : "Animationshastighet",
      "(slowFast)": "(långsamt - snabbt)",
      "valueBetween1And10": "Värde mellan 1 (långsamt) och 10 (snabbt).",
      "save": "Spara",
      "saved": "Sparat..."
    },
    "fr": {
      "resetButtonTitle": "Reinitialiser",
      "undoButtonTitle": "Annuler",
      "modelButtonTitle": "Solution",
      "gradeButtonTitle": "Score",

      "modelWindowTitle": "Solution",

      "feedbackLabel":"Type de controle: ",
      "continuous": "Continue",
      "atend": "A la fin",

      "fixLabel": "Parametres de controle continue",
      "undo": "Annuler les étapes incorrectes",
      "fix": "Corriger les étapes incorrectes",

      "scoreLabel": "Score:",
      "remainingLabel": "Points restants:",
      "lostLabel": "Points perdus:",
      "doneLabel": "Activite terminée",

      "yourScore": "Votre score:",
      "fixedSteps": "Corriger les étapes incorrectes:",

      "fixedPopup": "Votre dernière action etait incorrecte. Votre action a été corrigée pour vous permettre de poursuivre.",
      "fixFailedPopup": "Votre dernière action etait incorrecte et je ne sais pas comment la corriger. Votre action a ete annulée, essayez a nouveau.",
      "undonePopup": "Votre dernière action etait incorrecte. La simulation a été reinitialisée. Essayez a nouveau.",

      "settings": "Paramètres",
      "animationSpeed" : "Vitesse",
      "(slowFast)": "(lent - rapide)",
      "valueBetween1And10": "Vitesse entre 1 (Lent) et 10 (Rapide).",
      "save": "Sauvegarder",
      "saved": "Sauvegarde complète..."
    }
  };

  JSAV.init(function (options) {
    var language = options.lang || "en";
    if (typeof JSAV._translations[language] === "object") {
      this._translate = JSAV.utils.getInterpreter(JSAV._translations, language);
    } else {
      this._translate = JSAV.utils.getInterpreter(JSAV._translations, "en");
    }
  });

}(jQuery));
