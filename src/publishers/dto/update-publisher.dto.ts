import { PartialType } from '@nestjs/mapped-types'
import {CreatePublisherDto} from "./create-publisher.dto";

/**
 * DTO de actualización de libro
 */
export class UpdatePublisherDto extends PartialType(CreatePublisherDto) {}