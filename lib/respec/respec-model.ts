import {WebSpecification} from "../web-specification";

export class ReSpec extends WebSpecification {

  metadata: ReSpecMetadata = new ReSpecMetadata();

}

export class ReSpecMetadata {

  title: string | null = null;

}
