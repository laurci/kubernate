import {ISettingsParam, Logger} from "tslog";

const log = new Logger({
    displayInstanceName: false,
}).getChildLogger({
    name: "kubernate",
    dateTimePattern: "hour:minute:second.millisecond",
    displayFilePath: "hidden",
    displayLoggerName: true,
    minLevel: (process.env.LOG_LEVEL?.toLowerCase() ?? "info") as any,
});

export const makeLogger = (name: string, options?: Partial<ISettingsParam>) => {
    return log.getChildLogger({name, ...(options ?? {})});
};

export default log;
