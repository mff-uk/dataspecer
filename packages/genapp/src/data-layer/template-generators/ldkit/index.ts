import { CreateLdkitInstanceGenerator, CreateLdkitInstanceTemplate } from "./create-instance-generator.ts";
import { InstanceDeleteLdkitGenerator, InstanceDeleteLdkitTemplate } from "./instance-delete-generator.ts";
import { InstanceDetailLdkitReaderGenerator, InstanceDetailLdkitReaderTemplate } from "./instance-detail-reader-generator.ts";
import { InstanceListLdkitReaderGenerator, InstanceListLdkitReaderTemplate } from "./instance-list-reader-generator.ts";
import { EditLdkitInstanceGenerator, EditLdkitInstanceTemplate } from "./edit-instance-generator.ts";

export {
    CreateLdkitInstanceGenerator,
    InstanceDeleteLdkitGenerator,
    InstanceDetailLdkitReaderGenerator,
    InstanceListLdkitReaderGenerator,
    EditLdkitInstanceGenerator,

    CreateLdkitInstanceTemplate as CreateTemplate,
    InstanceDeleteLdkitTemplate as DeleteTemplate,
    InstanceDetailLdkitReaderTemplate as DetailTemplate,
    InstanceListLdkitReaderTemplate as ListTemplate,
    EditLdkitInstanceTemplate as EditTemplate
}