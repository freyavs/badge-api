export {};
import mongoose, { Document, Schema } from 'mongoose';
const global = require('../bin/global');

const AssertionSchema = new Schema(
  {
    '@context': { type: String, required: true },
    recipient: {
      type: { type: String, requiered: true },
      hashed: { type: Boolean, requiered: true },
      identity: { type: String, requiered: true },
      name: { type: String }
    },
    type: { type: String, required: true }, //"Assertion"
    badge: { type: String, required: true },
    issuedOn: { type: Date, required: true },
    evidence: { id: { type: String, requiered: true }, narrative: { type: String } }, //link to post
    verification: { type: { String, requiered: true } },
    accepted: { type: Boolean, default: false },
    answer: { type: String, default: '' } //could be anything,
  },
  {
    //makes sure showing this object doesn't give the _id info
    toJSON: {
      virtuals: true,
      transform: (doc: Document, obj: any) => {
        delete obj.__v;
        delete obj._id;
        obj.issuedOn = obj.issuedOn.toISOString();
        return obj;
      }
    }
  }
);

AssertionSchema.virtual('id').get(function (this: AssertionDocument) {
  return global.SERVER_URL + '/assertion/' + this._id;
});

interface AssertionI {
  '@context': string;
  recipient: any;
  type: string;
  badge: string;
  issuedOn: Date;
  evidence: any;
  verification: string;
  accepted: boolean;
  id: string;

  toJSON(): any;
}

//custom type for Assertion Document
export type AssertionDocument = AssertionI & Document;

//Export model
export default mongoose.model('Assertion', AssertionSchema);
