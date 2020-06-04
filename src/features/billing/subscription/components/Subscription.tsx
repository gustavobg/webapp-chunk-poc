import * as React from 'react';
import { useParams } from 'react-router-dom';
import merge from 'lodash.merge';

export default function Subscription() {
    let { slug } = useParams();

    const object = {
      'a': [{ 'b': 2 }, { 'd': 4 }]
    };
    const other = {
      'a': [{ 'c': 3 }, { 'e': 5 }]
    };

    merge(object, other);
    return (
        <div>
            Subscription 123 !!!! {slug}
        </div>
    )
};
