class ICondition {
   consturctor(id) {
      this.id = id;
   }

   check(env) {
      return true;
   }

   next(env) {
      return null;
   }

   prev(env) {
      return null;
   }
}

class Ant {
   constructor(id, mark) {
      this.id = id;
      this.mark = mark;
      // condition: check() && next() -> nextId
      this.condition = [];
      // by default conditionId
      this.byDefault = null;

      // in NFA, epsilon is a dummy state
      // it will not keep self and immediately
      // go to next state; therefore, `byDefault`
      // should not point to self
      //this.epsilon = false;
   }
}

class Flow {
   constructor() {
      this.ant = [];
      this.condition = [];
      this.initant = -1;
   }

   process(input) {
      const env = {
         in: input,
         i: 0,
         out: []
      };
      let cur = this.initant || 0;
      if (cur < 0) return env;
      while (env.i < env.in.length) {
         const a = this.ant[cur];
         if (!a) return env;
         let candidate = this.condition[a.byDefault];
         for (let i = 0, n = a.condition.length; i < n; i++) {
            const c = this.condition[a.condition[i]];
            if (c.check(env)) {
               candidate = c || candidate;
               break;
            }
         }
         const origin_i = env.i;
         cur = candidate.next(env);
         const a0 = this.ant[cur];
         if (!a0) return env;
         env.out[origin_i] = a0.mark;
      }
      return env;
   }
}

if (require.main === module) {
   const f = new Flow();
   f.condition = [{
      check: (env) => true,
      next: (env) => {
         env.i ++;
         return 0;
      },
   }, {
      check: (env) => {
         return '"' === env.in[env.i];
      },
      next: (env) => {
         env.i ++;
         return 1;
      },
   }, {
      check: (env) => true,
      next: (env) => {
         env.i ++;
         return 1;
      },
   }, {
      check: (env) => {
         return '"' === env.in[env.i];
      },
      next: (env) => {
         env.i ++;
         return 2;
      },
   }];
   f.ant = [{
      condition: [1],
      byDefault: 0,
      epsilon: false,
      mark: 'X',
   }, {
      condition: [3],
      byDefault: 2,
      epsilon: false,
      mark: 'S',
   }, {
      condition: [1],
      byDefault: 0,
      epsilon: false,
      mark: 'S',
   }];
   f.initant = 0;
   const input = 'hello"world"hello';
   const output = f.process(input);
   console.log(input);
   console.log(output.out.join(''));
}
