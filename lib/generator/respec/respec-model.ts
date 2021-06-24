import {WebSpecification} from "../web-specification/web-specification-model";

export class ReSpec extends WebSpecification {

  metadata: ReSpecMetadata = new ReSpecMetadata();

}

export class ReSpecMetadata {

  title: string | undefined = undefined;

}
