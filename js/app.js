/*
     * Store contribution data globally so that
     * changing garden types doesn't require
     * another API request.
     */

    let contributionData = [];


    /*
     * Current garden type.
     */

    let currentGarden = "flowers";


    /*
     * Extract GitHub username from:
     *
     * jessica
     * github.com/jessica
     * https://github.com/jessica
     * https://github.com/jessica/
     */

    function extractUsername(input) {

      input = input.trim();

      input = input
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/^github\.com\//, "");

      input = input.split("/")[0];

      return input.trim();

    }


    /*
     * Convert contribution count
     * into a visual growth level.
     *
     * 0 = empty
     * 1 = stage 1
     * 2 = stage 2
     * 3 = stage 3
     * 4 = stage 4
     * 5+ = fully grown
     */

    function getLevel(count) {

      if (count === 0) {
        return 0;
      }

      if (count === 1) {
        return 1;
      }

      if (count === 2) {
        return 2;
      }

      if (count === 3) {
        return 3;
      }

      if (count === 4) {
        return 4;
      }

      return 5;

    }


    /*
     * Render the garden.
     */

    function renderGarden() {

      const garden =
        document.getElementById("garden");

      garden.innerHTML = "";

      /*
       * Apply the current garden's color palette.
       */

      garden.className =
        `garden ${currentGarden}`;


      /*
       * Create one square for each contribution day.
       */

      contributionData.forEach(day => {

        const cell =
          document.createElement("div");

        const level =
          getLevel(day.count);

        cell.className =
          `day level-${level}`;


        /*
         * Make the tooltip display:
         *
         * Oct 5, 2026 · 3 contributions
         */

        const date =
          new Date(day.date + "T00:00:00");

        const formattedDate =
          date.toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
              year: "numeric"
            }
          );


        const contributionText =
          day.count === 1
            ? "contribution"
            : "contributions";


        cell.title =
          `${formattedDate} · ${day.count} ${contributionText}`;


        garden.appendChild(cell);

      });

    }


    /*
     * Change plant type.
     */

    function changeGarden(gardenType) {

      currentGarden = gardenType;

      /*
       * Update active button.
       */

      document
        .querySelectorAll(".plant-option")
        .forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.garden === gardenType
          );

        });


      /*
       * Re-render using same contribution data.
       */

      renderGarden();

    }


    /*
     * Fetch GitHub profile + contributions.
     */

    async function growGarden() {

      const input =
        document.getElementById("username");

      const error =
        document.getElementById("error");

      const card =
        document.getElementById("gardenCard");


      const username =
        extractUsername(input.value);


      error.textContent = "";


      if (!username) {

        error.textContent =
          "Enter a GitHub username first 🌱";

        return;

      }


      try {

        /*
         * --------------------------
         * GET GITHUB PROFILE
         * --------------------------
         */

        const profileResponse =
          await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
          );


        if (!profileResponse.ok) {

          throw new Error(
            "GitHub user not found"
          );

        }


        const profile =
          await profileResponse.json();


        /*
         * --------------------------
         * DISPLAY PROFILE
         * --------------------------
         */

        document.getElementById("avatar")
          .src = profile.avatar_url;


        document.getElementById("name")
          .textContent =
            profile.name || profile.login;


        document.getElementById("handle")
          .textContent =
            "@" + profile.login;


        /*
         * --------------------------
         * GET CONTRIBUTIONS
         * --------------------------
         *
         * This public endpoint provides
         * GitHub contribution calendar data.
         */

        const contributionResponse =
          await fetch(
            `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`
          );


        if (!contributionResponse.ok) {

          throw new Error(
            "Could not load contribution data"
          );

        }


        const contributionResult =
          await contributionResponse.json();


        /*
         * Save contribution data globally.
         */

        contributionData =
          contributionResult.contributions || [];


        /*
         * --------------------------
         * STATISTICS
         * --------------------------
         */

        let total = 0;
        let activeDays = 0;
        let bestDay = 0;


        contributionData.forEach(day => {

          total += day.count;

          if (day.count > 0) {
            activeDays++;
          }

          if (day.count > bestDay) {
            bestDay = day.count;
          }

        });


        document.getElementById("total")
          .textContent =
            total.toLocaleString();


        document.getElementById("activeDays")
          .textContent =
            activeDays.toLocaleString();


        document.getElementById("bestDay")
          .textContent =
            bestDay.toLocaleString();


        /*
         * --------------------------
         * RENDER GARDEN
         * --------------------------
         */

        renderGarden();


        /*
         * Show card.
         */

        card.classList.remove("hidden");

      }


      catch (err) {

        console.error(err);

        card.classList.add("hidden");

        error.textContent =
          "Couldn't grow this garden. Make sure the GitHub username is correct 🌱";

      }

    }


    /*
     * Pressing Enter submits the username.
     */

    document
      .getElementById("username")
      .addEventListener(
        "keydown",
        event => {

          if (event.key === "Enter") {
            growGarden();
          }

        }
      );
