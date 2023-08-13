class Ant {
   constructor(id, out) {
      this.id = id;
      this.out = out;
      this.next = [];
   }

   getO() { return this.out; }

   walk(I) {
      for (let i = 0; i < this.next.length; i++) {
         const one = this.next[i];
         if (one.I === I) return one.id;
      }
      return this.id;
   }

   gen(I, id) {
      const one = this.next.find(z => z.I === I && z.id === id);
      if (one) return;
      this.next.push({ I, id });
   }
}

class AntSystem {
   constructor() {
      this.autoid = 1;
      this.init = [new Ant(0, 0)];
   }

   predict(seq) {
      const outseq = [];
      let cur = this.init[0];
      for (let i = 0; i < seq.length; i++) {
         const nextId = cur.walk(seq[i]);
         if (!this.init[nextId]) continue;
         cur = this.init[nextId];
         outseq.push(cur.getO());
      }
      return outseq;
   }

   supervise(seq, outseq) {
      const out_ = [];
      let cur = this.init[0];
      for (let i = 0; i < seq.length; i++) {
         const I = seq[i];
         const nextId = cur.walk(I);
         if (!this.init[nextId]) continue;
         const cur_ = this.init[nextId];
         const O = outseq[i];
         const O_ = cur_.getO();
         if (O === O_) {
            cur = cur_;
            out_.push(O_);
         } else {
            let nextOne = this.init.find(z => z.getO() === O); // -> find, todo: multiple, select which
            if (!nextOne) {
               const ant = new Ant(this.autoid++, O); // -> grow
               this.init.push(ant);
               nextOne = ant;
            }
            cur.gen(I, nextOne.id); // -> learn
            nextOne = this.init[cur.walk(I)];
            if (nextOne) cur = nextOne;
            out_.push(cur.getO());
         }
      }
      if (!out_.length) return 0;
      const score = out_.map((z, i) => z === outseq[i] ? 1 : 0).reduce((a, x) => a + x, 0) / out_.length;
      return score;
   }
}

module.exports = {
   Ant,
};

if (module === require.main) { (() => {
   const seq = [0, 1, 1, 1, 0, 1];
   const sys = new AntSystem();
   const out = sys.predict(seq);
   console.log(seq, out);
   console.log('learn:', sys.supervise(seq, [1, 0, 1, 1, 1, 0]));
   const out_ = sys.predict(seq);
   console.log(seq, out_);
})(); }
