import { Dependable, IConstruct, IDependable } from 'constructs';
import { CfnResource } from './cfn-resource';
import { UnscopedValidationError } from './errors';
import { Intrinsic, IntrinsicProps } from './private/intrinsic';
import { Token } from './token';
import { ResolutionTypeHint } from './type-hints';
import { IResolveContext } from './resolvable';

export class DependentToken extends Intrinsic {
  public static asString(value: string, dependencies: IConstruct[]): string {
    return Token.asString(new DependentToken(value, dependencies, { typeHint: ResolutionTypeHint.STRING }));
  }

  public static asNumber(value: string, dependencies: IConstruct[]): number {
    return Token.asNumber(new DependentToken(value, dependencies, { typeHint: ResolutionTypeHint.NUMBER }));
  }

  public static asList(value: string, dependencies: IConstruct[]): string[] {
    return Token.asList(new DependentToken(value, dependencies, { typeHint: ResolutionTypeHint.STRING_LIST }));
  }

  private readonly dependables: readonly IDependable[];

  constructor(value: any, dependables: readonly IDependable[], options?: IntrinsicProps) {
    super(value, options);

    this.dependables = dependables;
  }

  public resolve(context: IResolveContext): any {
    const targetResource = context.scope;

    if (!CfnResource.isCfnResource(targetResource)) {
      throw new UnscopedValidationError(`Unable to express token's dependencies on ${context.scope.node.path} because it is not a CfnResource`);
    }

    const dependencyResources = this.dependables
      .flatMap(dependable => Dependable.of(dependable).dependencyRoots)
      .flatMap(dependencyRoot => dependencyRoot.node.findAll())
      .filter(CfnResource.isCfnResource);

    for (const dependencyResource of dependencyResources) {
      targetResource.addDependency(dependencyResource);
    }

    return super.resolve(context);
  }
}
