import configSerializer from './err-serializer';

describe('logger/err-serializer', () => {
  it('expands errors', () => {
    const err = {
      a: 1,
      b: 2,
      message: 'some message',
      url: 'some/path',
      response: {
        body: 'some response body',
      },
      gotOptions: {
        headers: {
          authorization: 'Bearer abc',
        },
        auth: 'test:token',
      },
    };
    expect(configSerializer(err)).toMatchSnapshot();
  });
  it('handles missing fields', () => {
    const err = { a: 1, stack: 'foo', body: 'some body' };
    expect(configSerializer(err)).toMatchSnapshot();
  });
});
