import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlCacheInterceptor extends CacheInterceptor {
  /**
   * Overrides the default trackBy method to generate a custom cache key
   * based on the GraphQL context, including the field name and arguments.
   * @param context - The execution context.
   * @returns A string representing the cache key or undefined to skip caching.
   */
  protected trackBy(context: ExecutionContext): string | undefined {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    const parentTypeName = info.parentType.name;
    const fieldName = info.fieldName;
    const args = ctx.getArgs();

    // Generate a unique cache key based on the field name and arguments
    return `${parentTypeName}:${fieldName}:${JSON.stringify(args)}`;
  }
}
