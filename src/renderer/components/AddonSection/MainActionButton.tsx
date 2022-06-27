import React, { FC } from "react";
import { ButtonType } from "renderer/components/Button";
import { SidebarButton } from "renderer/components/AddonSection/index";
import { InstallStatus, ApplicationStatus } from "renderer/components/AddonSection/Enums";
import { useAppSelector } from "renderer/redux/store";
import { InstallState } from "renderer/redux/features/installStatus";
import { Resolver } from "renderer/utils/Resolver";
import { Addon, Publisher } from "renderer/utils/InstallerConfiguration";

interface ActiveInstallButtonProps {
    addon: Addon,
    publisher: Publisher,
    installState: InstallState,
    onInstall: () => void,
    onCancel: () => void,
}

export const MainActionButton: FC<ActiveInstallButtonProps> = ({
    addon,
    publisher,
    installState: { status: installStatus },
    onInstall,
    onCancel,
}): JSX.Element => {
    const applicationStatus = useAppSelector(state => state.applicationStatus);

    const disallowedRunningExternalApps = addon.disallowedRunningExternalApps?.map((reference) => {
        const def = Resolver.findDefinition(reference, publisher);

        if (def.kind !== 'externalApp') {
            throw new Error(`definition (key=${def.key}) has kind=${def.kind}, expected kind=externalApp`);
        }

        return def;
    });

    if (disallowedRunningExternalApps?.some((it) => applicationStatus[it.key] === ApplicationStatus.Open)) {
        return (
            <SidebarButton disabled>
                Unavailable
            </SidebarButton>
        );
    }

    switch (installStatus) {
        case InstallStatus.DownloadDone:
        case InstallStatus.UpToDate:
            return (
                <SidebarButton disabled type={ButtonType.Positive}>
                    Installed
                </SidebarButton>
            );
        case InstallStatus.NeedsUpdate:
            return (
                <SidebarButton type={ButtonType.Caution} onClick={onInstall}>
                    Update
                </SidebarButton>
            );
        case InstallStatus.NotInstalled:
            return (
                <SidebarButton type={ButtonType.Positive} onClick={onInstall}>
                    Install
                </SidebarButton>
            );
        case InstallStatus.GitInstall:
            return (
                <SidebarButton disabled type={ButtonType.Positive} onClick={onInstall}>
                    Installed (git)
                </SidebarButton>
            );
        case InstallStatus.TrackSwitch:
            return (
                <SidebarButton type={ButtonType.Caution} onClick={onInstall}>
                    Switch Version
                </SidebarButton>
            );
        case InstallStatus.InstallingDependency:
        case InstallStatus.Downloading:
            return (
                <SidebarButton type={ButtonType.Danger} onClick={onCancel}>
                    Cancel
                </SidebarButton>
            );
        case InstallStatus.DownloadPrep:
        case InstallStatus.Decompressing:
        case InstallStatus.DownloadEnding:
            return (
                <SidebarButton disabled type={ButtonType.Neutral}>
                    Cancel
                </SidebarButton>
            );
        case InstallStatus.DownloadCanceled:
            return (
                <SidebarButton disabled type={ButtonType.Neutral}>
                    Cancelled
                </SidebarButton>
            );
        case InstallStatus.DownloadRetry:
        case InstallStatus.DownloadError:
        case InstallStatus.Unknown:
            return (
                <SidebarButton disabled type={ButtonType.Neutral}>
                    Error
                </SidebarButton>
            );
        default:
            return <></>;
    }
};
