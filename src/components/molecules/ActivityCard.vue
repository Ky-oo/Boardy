<template>
  <router-link
    :to="`/activity/${activity.id}`"
    class="rounded-2xl shadow-md text-custom-white flex justify-between h-full flex-col cursor-pointer"
  >
    <div class="relative">
      <div
        :class="[
          'flag',
          'absolute',
          'top-4',
          'left-4',
          'py-2',
          'px-4',
          getTypeColor,
          'rounded-3xl',
        ]"
      >
        {{ activity.type }}
      </div>
      <img
        :src="getImagePath"
        :alt="activity.title"
        class="w-full object-cover rounded-t-xl mb-4"
      />
      <div class="px-8">
        <h3 class="text-xl font-black mb-2 text-custom-blue truncate">
          {{ activity.title }}
        </h3>
        <p
          class="text-sm font-regular mb-4 text-primary whitespace-normal overflow-hidden wrap-break-word [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
        >
          {{ activity.description }}
        </p>
        <div class="px-3 text-primary">
          <div class="flex items-center mb-0.5">
            <IconAgenda class="text-custom-primary me-1" />
            <p class="text-sm font-black">{{ dateFormatted }}</p>
          </div>
          <div class="flex items-center mb-0.5">
            <IconTime class="text-custom-primary me-1" />
            <p class="text-sm font-black">{{ timeFormatted }}</p>
          </div>
          <div class="flex items-center mb-0.5">
            <IconNav class="text-custom-blue me-1" />
            <p class="text-sm font-black text-custom-blue">{{ getAddress }}</p>
          </div>
          <div class="flex items-center mb-0.5">
            <IconParticipant class="text-custom-primary me-1" />
            <p class="text-sm font-black">
              {{ participantsCount }} / {{ activity.seats }} participants
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="px-8 pb-6">
      <div class="flex justify-between items-center mt-4 text-primary">
        <div>
          <p class="text-custom-blue font-black">{{ getPrice }}</p>
        </div>
        <div class="flex items-center">
          <p>{{ getHost }}</p>
          <IconMeeple class="text-primary ms-1" />
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ActivityWithHost } from "@/types/Activity/index";
import IconAgenda from "@/components/atoms/icons/IconAgenda.vue";
import IconTime from "@/components/atoms/icons/IconTime.vue";
import IconNav from "../atoms/icons/IconNav.vue";
import IconParticipant from "../atoms/icons/IconParticipant.vue";
import IconMeeple from "../atoms/icons/IconMeeple.vue";

const props = defineProps<{
  activity: ActivityWithHost;
}>();

const dateFormatted = new Date(props.activity.date).toLocaleDateString(
  "fr-FR",
  {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
);

const timeFormatted = new Date(props.activity.date).toLocaleTimeString(
  "fr-FR",
  {
    hour: "numeric",
    minute: "numeric",
  }
);

const getImagePath = computed(() => {
  return `/img/home/img-${props.activity.hostType}.png`;
});

const participantsCount = computed(() => {
  const guests = props.activity.guestUsers?.length ?? 0;
  return props.activity.playersId.length + guests;
});

const getPrice = computed(() => {
  if (typeof props.activity.price === "number") {
    return props.activity.price === 0 ? "Gratuit" : props.activity.price + " €";
  }
  return "";
});

const getAddress = computed(() => {
  if (props.activity.homeHost === true && props.activity.host) {
    return `${props.activity.city}, Chez ${props.activity.host.firstname} ${
      props.activity.host.lastname ?? ""
    }`;
  }
  let ville = "";
  if (props.activity.address) {
    const parts = props.activity.address
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const regionsRaw = [
      "auvergne-rhône-alpes",
      "provence-alpes-côte d'azur",
      "occitanie",
      "bourgogne-franche-comté",
      "grand est",
      "hauts-de-france",
      "normandie",
      "nouvelle-aquitaine",
      "bretagne",
      "centre-val de loire",
      "corse",
      "île-de-france",
      "pays de la loire",
    ];
    const departementsRaw = [
      "ain",
      "aisne",
      "allier",
      "alpes-de-haute-provence",
      "hautes-alpes",
      "alpes-maritimes",
      "ardèche",
      "ardennes",
      "ariege",
      "aube",
      "aude",
      "aveyron",
      "bouches-du-rhône",
      "calvados",
      "cantal",
      "charente",
      "charente-maritime",
      "cher",
      "corrèze",
      "corse-du-sud",
      "haute-corse",
      "côte-d'or",
      "côtes-d'armor",
      "creuse",
      "dordogne",
      "doubs",
      "drôme",
      "eure",
      "eure-et-loir",
      "finistière",
      "gard",
      "haute-garonne",
      "gers",
      "gironde",
      "hérault",
      "ille-et-vilaine",
      "indre",
      "indre-et-loire",
      "isère",
      "jura",
      "landes",
      "loir-et-cher",
      "loire",
      "haute-loire",
      "loire-atlantique",
      "loiret",
      "lot",
      "lot-et-garonne",
      "lozère",
      "maine-et-loire",
      "manche",
      "marne",
      "haute-marne",
      "mayenne",
      "meurthe-et-moselle",
      "meuse",
      "morbihan",
      "moselle",
      "nièvre",
      "nord",
      "oise",
      "orne",
      "pas-de-calais",
      "puy-de-dôme",
      "pyrenees-atlantiques",
      "hautes-pyrenees",
      "pyrenees-orientales",
      "bas-rhin",
      "haut-rhin",
      "rhône",
      "haute-saône",
      "saône-et-loire",
      "sarthe",
      "savoie",
      "haute-savoie",
      "paris",
      "seine-maritime",
      "seine-et-marne",
      "yvelines",
      "deux-sèvres",
      "somme",
      "tarn",
      "tarn-et-garonne",
      "var",
      "vaucluse",
      "vendée",
      "vienne",
      "haute-vienne",
      "vosges",
      "yonne",
      "territoire de belfort",
      "essonne",
      "hauts-de-seine",
      "seine-saint-denis",
      "val-de-marne",
      "val-d'oise",
    ];
    // Normalisation accents/casse pour matching fiable
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
    const regions = regionsRaw.map(normalize);
    const departements = departementsRaw.map(normalize);
    // Chercher le premier département/région à partir de la fin
    let villeTrouvee = false;
    // On part de la fin, on saute tous les segments qui sont département/région/pays/code postal
    let i = parts.length - 1;
    while (i >= 0) {
      const partNorm = (parts[i] ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      if (
        partNorm === "" ||
        partNorm.includes("france") ||
        partNorm.includes("métropolitaine") ||
        /^\d{5}$/.test(partNorm) ||
        regions.includes(partNorm) ||
        departements.includes(partNorm)
      ) {
        i--;
        continue;
      }
      ville = parts[i] ?? "";
      villeTrouvee = true;
      break;
    }
    // Si pas trouvé, fallback sur le premier segment valide en partant de la fin
    if (!villeTrouvee) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const partNorm = (parts[i] ?? "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");
        if (
          partNorm === "" ||
          partNorm.includes("france") ||
          partNorm.includes("métropolitaine") ||
          /^\d{5}$/.test(partNorm) ||
          regions.includes(partNorm) ||
          departements.includes(partNorm)
        ) {
          continue;
        }
        ville = parts[i] ?? "";
        break;
      }
    }
  }
  let result = props.activity.place_name;
  if (ville) result += ", " + ville;
  return result;
});

const getHost = computed(() => {
  if (props.activity.hostType === "user" && props.activity.host) {
    return `Par ${props.activity.host.firstname}`;
  }
  if (
    props.activity.hostType === "organisation" &&
    props.activity.organisation
  ) {
    return `Par ${props.activity.organisation.name}`;
  }
  if (props.activity.hostType === "event") {
    return "Par Boardy";
  }
  return "";
});

const getTypeColor = computed(() => {
  if (props.activity.type === "Festival") {
    return "bg-custom-white text-primary";
  } else if (props.activity.type === "Par des joueurs") {
    return "bg-custom-green text-primary";
  } else if (props.activity.type === "Bars & Soirées") {
    return "bg-custom-red";
  }
});
</script>
