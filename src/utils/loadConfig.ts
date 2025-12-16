import { loadConfigs } from "../config-schemas";

export const CONFIG_FOLDER = import.meta.dir + "/../configs";

export const config = await loadConfigs(CONFIG_FOLDER);
