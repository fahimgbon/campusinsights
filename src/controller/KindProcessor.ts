import JSZip from "jszip";
import {InsightDatasetKind, IInsightFacade, InsightError, InsightDataset, InsightResult, NotFoundError} from
	"./IInsightFacade";


export interface KindProcessor {
    processZipContents(id: string, kind: InsightDatasetKind, zipContents: JSZip): Promise<string[]>;
}
