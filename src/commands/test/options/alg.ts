import { AlgorithmOption as AlgorithmBaseOption } from "../../../options/alg";

export class AlgorithmOption extends AlgorithmBaseOption {
    public description = "Optional. Algorithm name. Default 'all'";
    public isRequired = false;
    public defaultValue = "all";
}
