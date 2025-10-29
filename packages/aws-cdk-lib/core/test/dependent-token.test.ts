import { Construct } from 'constructs';
import * as core from '../lib';
import { CLOUDFORMATION_TOKEN_RESOLVER } from '../lib/private/cloudformation-lang';

describe('dependent token', () => {
  describe('resolve', () => {
    test('adds dependency relationship between CfnResources directly', () => {
      const stack = new core.Stack();
      const resource1 = new core.CfnResource(stack, 'Resource1', {
        type: 'Test::Resource::Fake',
      });
      const token = new core.DependentToken('FakeValue', [resource1]);

      const resource2 = new core.CfnResource(stack, 'Resource2', {
        type: 'Test::Resource::Fake',
      });

      const result = core.Tokenization.resolve(token, {
        scope: resource2,
        resolver: CLOUDFORMATION_TOKEN_RESOLVER,
      });

      expect(result).toEqual('FakeValue');
      expect(resource2.obtainResourceDependencies()).toContain(resource1);
    });

    test('adds dependency relationship between CfnResources indirectly', () => {
      const stack = new core.Stack();
      const construct1 = new Construct(stack, 'Construct1');
      const resource1 = new core.CfnResource(construct1, 'Resource1', {
        type: 'Test::Resource::Fake',
      });
      const token = new core.DependentToken('FakeValue', [construct1]);

      const resource2 = new core.CfnResource(stack, 'Resource2', {
        type: 'Test::Resource::Fake',
      });

      const result = core.Tokenization.resolve(token, {
        scope: resource2,
        resolver: CLOUDFORMATION_TOKEN_RESOLVER,
      });

      expect(result).toEqual('FakeValue');
      expect(resource2.obtainResourceDependencies()).toContain(resource1);
    });
  });
});
