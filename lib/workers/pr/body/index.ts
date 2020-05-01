import { platform } from '../../../platform';
import * as template from '../../../util/template';
import { get } from '../../../versioning';
import { BranchConfig } from '../../common';
import { getPrBanner } from './banner';
import { getChangelogs } from './changelogs';
import { getPrConfigDescription } from './config-description';
import { getControls } from './controls';
import { getPrFooter } from './footer';
import { getPrExtraNotes, getPrNotes } from './notes';
import { getPrUpdatesTable } from './updates-table';

function massageUpdateMetadata(config: BranchConfig): void {
  config.upgrades.forEach((upgrade) => {
    /* eslint-disable no-param-reassign */
    const { homepage, sourceUrl, sourceDirectory, changelogUrl } = upgrade;
    let depNameLinked = upgrade.depName;
    const primaryLink = homepage || sourceUrl;
    if (primaryLink) {
      depNameLinked = `[${depNameLinked}](${primaryLink})`;
    }
    const otherLinks = [];
    if (homepage && sourceUrl) {
      otherLinks.push(`[source](${sourceUrl})`);
    }
    if (changelogUrl) {
      otherLinks.push(`[changelog](${changelogUrl})`);
    }
    if (otherLinks.length) {
      depNameLinked += ` (${otherLinks.join(', ')})`;
    }
    upgrade.depNameLinked = depNameLinked;
    const references: string[] = [];
    if (homepage) {
      references.push(`[homepage](${homepage})`);
    }
    if (sourceUrl) {
      let fullUrl = sourceUrl;
      if (sourceDirectory) {
        fullUrl =
          sourceUrl.replace(/\/?$/, '/') +
          'tree/HEAD/' +
          sourceDirectory.replace('^/?/', '');
      }
      references.push(`[source](${fullUrl})`);
    }
    if (changelogUrl) {
      references.push(`[changelog](${changelogUrl})`);
    }
    upgrade.references = references.join(', ');
    const { fromVersion, toVersion, updateType, versioning } = upgrade;
    // istanbul ignore if
    if (updateType === 'minor') {
      try {
        const version = get(versioning);
        if (version.getMinor(fromVersion) === version.getMinor(toVersion)) {
          upgrade.updateType = 'patch';
        }
      } catch (err) {
        // do nothing
      }
    }
    /* eslint-enable no-param-reassign */
  });
}

export async function getPrBody(config: BranchConfig): Promise<string> {
  massageUpdateMetadata(config);
  const content = {
    banner: getPrBanner(config),
    table: getPrUpdatesTable(config),
    notes: getPrNotes(config) + getPrExtraNotes(config),
    changelogs: getChangelogs(config),
    configDescription: await getPrConfigDescription(config),
    controls: getControls(),
    footer: getPrFooter(config),
  };
  const defaultPrBodyTemplate =
    '{{{banner}}}{{{table}}}{{{notes}}}{{{changelogs}}}{{{configDescription}}}{{{controls}}}{{{footer}}}';
  const prBodyTemplate = config.prBodyTemplate || defaultPrBodyTemplate;
  let prBody = template.compile(prBodyTemplate, content, false);
  prBody = prBody.trim();
  prBody = prBody.replace(/\n\n\n+/g, '\n\n');
  prBody = platform.getPrBody(prBody);
  return prBody;
}
